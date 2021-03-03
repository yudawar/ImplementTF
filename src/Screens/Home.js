import React, { Component } from 'react'
import { Text, View, SafeAreaView, Button, Dimensions, ScrollView , PixelRatio} from 'react-native'

import {Constants} from 'react-native-unimodules'
import * as tf from '@tensorflow/tfjs';
import { fetch, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as jpeg from 'jpeg-js'
import ReactMoE, {
  MoEAppStatus
} from 'react-native-moengage'


export default class Home extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
          questionDetector: '',
          imageLink: "https://www.unicef.org/sudan/sites/unicef.org.sudan/files/styles/hero_desktop/public/1920x1080%20Banner%202.jpg?itok=tI7ypoZF",
          predictions: '-',
          isLoading: false,
          width:Dimensions.get('screen').width,
          height:Dimensions.get('screen').height,
          wwidth:Dimensions.get('window').width,
          wheight:Dimensions.get('window').height,
          // pixelWidth: PixelRatio. ,
          // pixelHeight:
          
        };
    
      }
    
      componentDidMount() {
        console.log('[+]starting apps')
        this.loadModel()
        // console.log('[+] setting user unique ID')
        // ReactMoE.setUserUniqueID("abc@xyz.com");
        console.log('[+] check reactMoe function')
        ReactMoE.initialize();
        ReactMoE.setAppStatus(MoEAppStatus.Install);
        
      }
    
      async loadModel() {
        try {
          console.log("[+] Application started")
          //Wait for tensorflow module to be ready
          await tf.ready();
      
          console.log("[+] Loading custom mask detection model");
          //Replce model.json and group1-shard.bin with your own custom model
      
          const modelJson = await require("../../assets/model/model.json");
          const modelWeight = await require("../../assets/model/group.bin");
          const questionDetector = await tf.loadLayersModel(bundleResourceIO(modelJson,modelWeight));
          console.log("[+] Loading pre-trained face detection model");
          //Assign model to variable
          this.setState({
            questionDetector: questionDetector
          });
          console.log("[+] Model Loaded");
        } catch (error) {
          console.log('===error di load model', error)
        }
      }
    
      async imageToTensor(rawImageData){
        try {
          console.log('masuk image to tensor')
          //Function to convert jpeg image to tensors
          const response = await fetch(this.state.imageLink, {}, { isBinary: true });
          const rawImageData = await response.arrayBuffer();
          const TO_UINT8ARRAY = true;
          const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY);
          // Drop the alpha channel info for mobilenet
          const buffer = new Uint8Array(width * height * 3);
          let offset = 0; // offset into original data
          for (let i = 0; i < buffer.length; i += 3) {
            buffer[i] = data[offset];
            buffer[i + 1] = data[offset + 1];
            buffer[i + 2] = data[offset + 2];
            offset += 4;
          }
          // return tf.tensor3d(buffer, [height, width, 3]); 
          rgbaTens3d= tf.tensor3d(buffer, [height, width, 3]);
          const rgbTens3d= tf.slice3d(rgbaTens3d, [0, 0, 0], [-1, -1, 3]) // strip alpha channel
          const smallImg = tf.image.resizeNearestNeighbor(rgbTens3d, [128, 128]);
          const resImg = tf.expandDims(smallImg, axis=0);
          return resImg;
        } catch (error) {
          console.log('===error di iamge to tensor', error)
          this.setState({
            errorState: error
          })
        }
      }
    
    
      async classify (model, path){
        try {
          console.log('==========||==========')
          console.log('==========||==========')
          this.setState({
            isLoading: true
          })
      
          const input = await this.imageToTensor();
          console.log('ini question detector',this.state.questionDetector)
          console.log(input)
          const predictions = await this.state.questionDetector.predict(input).data();
      
          console.log('classification results:', predictions); 
          this.setState({
            predictions,
            isLoading: false
          })
        } catch (error) {
          console.log('===error di classify===',error)
          this.setState({
            errorState: 'gagal'
          })
        }
      }
    
    
      // render () {
      //   return <Navigation />
      // }
      render() {
        ReactMoE.showInApp()
        return (
          <SafeAreaView>
            {/* <Text> textInComponent </Text>
            <Text>{Constants.systemFonts}</Text>
            <Text>{this.state.isLoading+''}</Text>
            <Text>{this.state.predictions}</Text>
            <Button title="classify" onPress={() =>this.classify()}/> */}
    
            <ScrollView>
            <View style={{
              width: this.state.width,
              height: this.state.height,
              backgroundColor: 'pink',
              // justifyContent: 'space-between'
            }}>
              <Text>ini pake screen</Text>
              <Text>Height: {this.state.height}</Text>
              <Text>Width: {this.state.width}</Text>
              <Text>{PixelRatio.get()}</Text>
              <Text>{PixelRatio.getPixelSizeForLayoutSize(this.state.width)}</Text>
              <Text>{PixelRatio.getPixelSizeForLayoutSize(this.state.height)}</Text>
            </View>
            <Button 
                title="to Pertama"
                onPress={() => this.props.navigation.navigate('ScreenPertama') }
                />
            </ScrollView>
          </SafeAreaView>
        )
      }
}
