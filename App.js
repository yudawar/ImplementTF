// import React, { Component } from 'react'
// import { Text, View } from 'react-native'

// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react-native';

// export default class App extends Component {
//   render() {
//     return (
//       <View>
//         <Text> textInComponent </Text>
//       </View>
//     )
//   }
// } hapus yang ini nantinya ya

import React, { Component } from 'react'
import { Text, View, SafeAreaView, Button } from 'react-native'

import {Constants} from 'react-native-unimodules'
import * as tf from '@tensorflow/tfjs';
import { fetch, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as jpeg from 'jpeg-js'

export default class App extends Component {
  
  constructor(props) {
    super(props)

    this.state = {
      questionDetector: '',
      imageLink: "https://www.unicef.org/sudan/sites/unicef.org.sudan/files/styles/hero_desktop/public/1920x1080%20Banner%202.jpg?itok=tI7ypoZF",
      predictions: '-',
      isLoading: false,
    };

  }

  componentDidMount() {
    console.log('[+]starting apps')
    this.loadModel()
  }

  async loadModel() {
    try {
      console.log("[+] Application started")
      //Wait for tensorflow module to be ready
      await tf.ready();
  
      console.log("[+] Loading custom mask detection model");
      //Replce model.json and group1-shard.bin with your own custom model
  
      const modelJson = await require("./assets/model/model.json");
      const modelWeight = await require("./assets/model/group.bin");
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

  render() {
    return (
      <SafeAreaView>
        <Text> textInComponent </Text>
        {/* <Text>{Constants.systemFonts}</Text> */}
        <Text>{this.state.isLoading+''}</Text>
        <Text>{this.state.predictions}</Text>
        <Button title="classify" onPress={() =>this.classify()}/>
      </SafeAreaView>
    )
  }
}