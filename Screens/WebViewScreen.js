import {SafeAreaView, View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Clipboard} from "react-native";
import {WebView} from 'react-native-webview';
import {useEffect, useReducer, useRef, useState} from "react";
import * as cheerio from "cheerio-without-node-native";

export default function WebViewScreen({navigation, route}) {
    const [scrollViewHeight, setScrollViewHeight] = useState(100)
    const scrollViewRef = useRef(null);
    const [query, setQuery] = useState('?q=%5BUK%5D')
    const [search, setSearch] = useState('')
    const [html, setHtml] = useState(null)

    const copyLink = (href) => {
        Clipboard.setString(href)
        scrollViewRef.current?.scrollToEnd({animated: true})
    }

    useEffect(() => {
        async function loadStreamsList(query) {
            const filteredQuery = query.replaceAll('[', '%5B').replaceAll(']', '%5D')
            const searchUrl = `https://acestreamsearch.net/en/${filteredQuery}`;
            const response = await fetch(searchUrl);
            const htmlString = await response.text();
            const $ = cheerio.load(htmlString);
            const aList = $(".list-group > li > a")
                .map((index, a) => ({href: a.attribs.href, name: a.children[0].data}))

            setHtml(Object.values(aList).filter(item => item.href));
        }

        loadStreamsList(query)
    }, [query])

    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView
                ref={scrollViewRef}
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{flexGrow:1, height: scrollViewHeight}}
                renderToHardwareTextureAndroid={true}
            >
                <View onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height + 600)}>
                    <TextInput
                        style={styles.input}
                        onChangeText={setSearch}
                        value={search}
                    />
                    <TouchableOpacity
                        onPress={() => setQuery('?q=' + search)}
                        style={styles.appButtonContainer}
                    >
                        <Text style={styles.appButtonText}>Search</Text>
                    </TouchableOpacity>
                    <View>
                        {html?.map((item) => (
                            <TouchableOpacity
                                key={item.href}
                                onPress={() => copyLink(item.href)}
                                style={{...styles.appButtonContainer, backgroundColor: 'indigo'}}
                            >
                                <Text style={styles.appButtonText}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <WebView
                    source={{uri: route.params.url}}
                />
            </ScrollView>

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
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    appButtonContainer: {
        elevation: 8,
        backgroundColor: "#009688",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 20
    },
    appButtonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase"
    }
});