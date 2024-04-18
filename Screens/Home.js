import {
    SafeAreaView,
    TextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
    ToastAndroid,
    View,
} from 'react-native';
import {useEffect, useState} from "react";
import {CameraView, Camera} from "expo-camera/next";

export default function Home({navigation}) {
    const [port, setPort] = useState('')
    const [hasPermission, setHasPermission] = useState(null);

    const handleOnPress = async () => {
        fetch('http://192.168.0.8:' + port + '/acecast/').then(function (response) {
            if (response.ok) {
                navigation.navigate('WebViewScreen', {port: port})
            } else {
                ToastAndroid.showWithGravity(
                    'Fetch response !== 200',
                    ToastAndroid.LONG,
                    ToastAndroid.CENTER,
                );
            }
        })
            .catch(function (error) {
                ToastAndroid.showWithGravity(
                    error.message + '. Possible wrong port number.',
                    ToastAndroid.LONG,
                    ToastAndroid.CENTER,
                );
            });
    }

    const handleBarCodeScanned = ({ data }) => {
        console.log(data)
        if (data.startsWith('http://192.168.0.8')){
            const port = data.split(":")[2].split('/')[0]
            setPort(port);
            navigation.navigate('WebViewScreen', {port: port})
        } else {
            ToastAndroid.showWithGravity(
                'Invalid QR code',
                ToastAndroid.LONG,
                ToastAndroid.CENTER,
            );
        }
    };

    const renderCamera = () => {
        if (!hasPermission) {
            return <View><Text>Camera permission not granted</Text></View>;
        }

        return (
            <View style={styles.cameraContainer}>
                <CameraView
                    onBarcodeScanned={handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                    style={StyleSheet.absoluteFillObject}
                    zoom={0.7}
                />
            </View>
        )
    }

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        };

        getCameraPermissions();
    });

    return (
        <SafeAreaView style={styles.container}>
            <Text style={{fontWeight: 'bold', fontSize: 15}}>Scan QR code</Text>
            {renderCamera()}
            <Text style={{marginVertical: 20}}>or</Text>
            <View style={{width: '100%'}}>
                <View>
                    <Text style={{fontWeight: 'bold', fontSize: 15, paddingHorizontal: 18}}>Port number</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={setPort}
                        value={port}
                        keyboardType='numeric'
                        autoFocus={true}
                    />
                </View>

                <TouchableOpacity
                    onPress={async () => handleOnPress()}
                    style={{...styles.appButtonContainer, ...{opacity: port ? 1 : 0.6}}}
                    disabled={!port}
                >
                    <Text style={styles.appButtonText}>Enter</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        width: '90%',
        height: 40,
        margin: 1,
        borderWidth: 1,
        padding: 10,
        alignSelf: 'center',
    },
    appButtonContainer: {
        elevation: 8,
        backgroundColor: "#009688",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        width: '90%',
        marginTop: 20,
        alignSelf: 'center',
    },
    appButtonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase"
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    cameraContainer: {
        width: '90%',
        aspectRatio: 1,
        overflow: 'hidden',
        borderRadius: 10,
    },
    camera: {
        flex: 1,
    },
});