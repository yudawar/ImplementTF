import React, { Component } from 'react'
import { Text, View, Button } from 'react-native'

export default class ScreenPertama extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            
        }
    }
    
    render() {
        return (
            <View>
                <Text> Screen pertama </Text>
                <Button 
                title="to Kedua"
                onPress={() => this.props.navigation.navigate('ScreenKedua') }
                />
            </View>
        )
    }
}

