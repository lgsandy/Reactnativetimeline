import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback
} from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import firebase from 'react-native-firebase';
import { connect } from 'react-redux'
import Spinner from 'react-native-spinkit'
import StarterTimeLineEvent from '../../models/StarterTimeLineEvent'
import Dash from 'react-native-dash'
import { chagneBottomSheetScrollState } from '../main/actions';

class StarterTimeLine extends React.PureComponent {

    constructor(props) {
        super(props)
        const response = this.getNumberOfMotors();

        this.state = {
            'renderReports': false,
            timelineObjs: [],
            filters: [],
            activeKey: "All",
            'motorCount': response['motorCount'],
            'espId': response['espId'],
            'gatewayMacId': response['gatewayMacId']
        }
    }

    getNumberOfMotors() {
        var profileInfo = JSON.parse(this.props.profileData['layoutinfo'])
        var response = {
            'espId': this.props.profileData['gcloud_id'],
            'gatewayMacId': this.props.profileData['gateWayMacId']
        }
        var starterList = profileInfo['starterList']
        var motorCount = 4
        for (var index = 0; index < starterList.length; index++) {
            const starter = starterList[index]
            if (starter['macId'] === this.props.starterMacId) {
                motorCount = starter['motorsCount']
                break
            }
        }
        response['motorCount'] = motorCount
        return response
    }

    componentDidMount() {
        this.getTimeLineData()
        this.prepareFilterOptions()
    }

    prepareFilterOptions() {
        var filters = []
        filters.push(this._prepareFilterTaData("All", "All", 0, this.state['activeKey']))
        filters.push(this._prepareFilterTaData("Configuration", "Configuration", 0, this.state['activeKey']))
        filters.push(this._prepareFilterTaData("Power & Voltage Fault", "Power & Voltage Fault", 0, this.state['activeKey']))
        filters.push(this._prepareFilterTaData("Current Fault", "Current Fault", 0, this.state['activeKey']))
        this.setState({
            'filters': filters
        })
    }

    _prepareFilterTaData(title, key, count, activeKey) {
        var isActive = false;
        if (activeKey == key) isActive = true;
        return {
            key: key,
            label: title,
            barColor: 'transparent',
            pressColor: 'rgba(1, 81, 130 ,0.2)',
            index: 1,
            count: count,
            isActive: isActive,
            isStarterFilter: true
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps._sel_date !== this.props._sel_date) {
            console.log('componentDidUpdate ');
            this.setState({
                'renderReports': false
            })
            this.getTimeLineData()
            this.prepareFilterOptions()
        }
    }

    render() {
        console.log('Render');

        return (
            <View style={styles.card}>
                <View style={{ width: '100%', justifyContent: "center", flexDirection: 'column' }}>
                    <Text style={{ marginTop: 10, fontFamily: 'BrandonText-Bold', fontSize: 18 }}>
                        {this.props._starterName + ' Time Line'}
                    </Text>

                    {this.state.renderReports ?
                        this.renderTimeLine() :
                        <Spinner style={styles.spinner}
                            size={150}
                            type='Bounce'
                            color='#0071D0' />}
                </View>

            </View>
        )
    }

    renderTimeLine() {
        return (

            <View style={{ width: '100%', height: 500 }}>
                <FlatList
                    data={this.state.timelineObjs}
                    scrollEnabled={true}
                    zIndex={1}
                    contentContainerStyle={{ paddingBottom: 15 }}
                    keyExtractor={(item, index) => item['id']}
                    renderItem={({ item, index }) => this.renderTimeLineEventUI(item)}
                />
            </View>
        )
    }

    getConfigurationData() {
        const time = this.getTimeInfo()
        console.log('Time ', time);
        console.log(`gateways/${this.state['gatewayMacId']}/device_config_updates/${this.state['espId']}/STConfCmd`);

        firebase
            .firestore().collection(`gateways/${this.state['gatewayMacId']}/device_config_updates/${this.state['espId']}/STConfCmd`)
            .where('version', '>=', (time['start'] * 1000))
            .where('version', '<=', (time['end'] * 1000))
            .get().then(queryData => {
                console.log('Config data ', queryData.docs.length);
                if (queryData.docs.length > 0) {
                    console.log('Got Config data');
                    this.parseConfigData(queryData.docs)
                } else this.setState({
                    'renderReports': true
                })
            }).catch(err => {
                console.log(err);
            })
    }

    parseConfigData(docs) {
        var configDocs = []
        for (var index = 0; index < docs.length; index++) {
            var starterTimeLineEvent = new StarterTimeLineEvent(docs[index].data(),
                this.state['motorCount'], false)
            if (starterTimeLineEvent['macId'] === this.props.starterMacId)
                configDocs.push(starterTimeLineEvent)
        }
        console.log('Config docs len - ', configDocs.length);

        var timeLineData = [...this.state.timelineObjs, ...configDocs]
        console.log('Config docs len - ', timeLineData.length);
        this.sortData(timeLineData).then(sortedTimeLineData => {
            this.setState({
                'renderReports': true,
                'timelineObjs': sortedTimeLineData
            })
        }).catch(err => {
            console.log(err);
            this.setState({
                'renderReports': true,
                'timelineObjs': timeLineData
            })
        })
    }

    sortData(timeLineData) {
        console.log('Sort data');

        return new Promise((resolve, reject) => {
            timeLineData.sort((event1, event2) => { return event2.id - event1.id })
            resolve(timeLineData)
        })
    }

    renderTimeLineEventUI(item) {
        if (item['isTimeLine'] === true) {
            return (
                <View style={{ flexDirection: 'column' }} >
                    <View style={{ width: '100%', flexDirection: 'row', top: 10 }}>
                        <Text style={{ ...styles.motorReferenceVal, alignSelf: 'flex-end', width: '15%', bottom: 3 }}>{item['time']}</Text>

                        <View style={{ width: '2%', height: 50 }}>
                            <Dash style={{ height: 25, flexDirection: 'column' }}
                                dashLength={3} dashColor={"#78787840"} />
                            <View style={{ ...styles.emptyCircle, top: 5, alignContent: 'flex-start', left: -5 }}>
                                <View style={{ ...styles.circle, alignSelf: 'center', top: 2 }} />
                            </View>
                            {item.faultMsg !== '' ?
                                <Dash style={{ height: 35, flexDirection: 'column' }}
                                    dashLength={3} dashColor={"#78787840"} />
                                : []
                            }
                        </View>
                        <View style={{ width: '83%', alignContent: 'flex-start' }}>
                            {this.renderTimeLineObjs(item)}
                        </View>
                    </View>
                    {item.faultMsg !== '' ?
                        <Text style={{
                            ...styles.motorReferenceVal, color: '#ea4335',
                            right: 12,
                            alignSelf: 'flex-end', width: '100%', textAlign: 'right',
                            marginTop: 10
                        }}>
                            {item['faultMsg']}
                        </Text> : []}
                </View>
            )
        } else {
            return (

                <View style={{ width: '100%', flexDirection: 'row', top: 10 }}>
                    <Text style={{ ...styles.motorReferenceVal, alignSelf: 'flex-end', width: '15%', bottom: 3 }}>{item['time']}</Text>

                    <View style={{ width: '2%' }}>
                        <Dash style={{ height: 60, flexDirection: 'column' }}
                            dashLength={3} dashColor={"#78787840"} />
                        <View style={{ ...styles.emptyCircle, alignContent: 'flex-start', left: -5 }}>
                            <View style={{ ...styles.circle, alignSelf: 'center', top: 2 }} />
                        </View>
                        <Dash style={{ height: 40, flexDirection: 'column' }}
                            dashLength={3} dashColor={"#78787840"} />
                    </View>
                    <View style={{ width: '83%', alignContent: 'center' }}>
                        {this.renderConfigObj(item)}
                    </View>
                </View>
            )
        }
    }

    renderTimeLineObjs(dataItem) {
        return (
            <View style={{ flexDirection: 'row', width: '100%', alignContent: 'flex-start' }}>
                {this.renderTimeLineEventCapsule(dataItem)}
            </View>
        )
    }

    renderConfigObj(configItem) {
        return (
            <View style={{ flexDirection: 'row', width: '100%', alignContent: 'center' }}>
                <View style={{ ...styles.horizentalline, width: '25%', alignSelf: 'center', top: 16 }} />
                <View style={{
                    width: '71%',
                    alignSelf: "center",
                    top: 16,
                    ...styles.configEventBg
                }} flexDirection='column'>
                    <Text style={{
                        ...styles.motorReferenceVal, textAlign: 'left', marginLeft: 10
                    }}>{configItem.configStringMsg()}</Text>
                </View>
            </View>
        )
    }

    renderTimeLineEventCapsule(timeLineEvent) {
        var capsules = []
        const width = (100 / (this.state.motorCount + 1)).toFixed(0) + '%'
        for (var index = 0; index < timeLineEvent['motorData'].length; index++) {
            var item = timeLineEvent['motorData'][index]
            capsules.push(
                <View style={{ flexDirection: 'row', width: width, marginTop: 5, marginLeft: -3 }}>
                    <View style={{ ...styles.horizentalline, width: '30%', bottom: 9 }} />
                    {item['motor'] === true ? <Text style={{
                        width: '70%',
                        ...styles.updateBtn,
                        ...item.motorBgStyle,
                        textAlign: 'center',
                        justifyContent: 'center'
                    }}>{item['currentVal'].toFixed(1)}</Text> :
                        <Text style={{
                            width: '70%',
                            ...styles.updateBtn,
                            ...timeLineEvent['pillStyleInfo'],
                            textAlign: 'center',
                            justifyContent: 'center'
                        }}>{item['voltage'].toFixed(1)}</Text>}
                </View>
            )
        }
        return capsules
    }

    getTimeLineData() {
        this.fetchTimeLineData().then(response => {
            return this.parseTimeLineData(response)
        }).then(timeLineArr => {
            console.log(`===== Got time line data ====== `, timeLineArr.length);
            this.setState({
                'timelineObjs': timeLineArr
            })
            this.getConfigurationData()
        })
            .catch(err => {
                console.log(err)
            })
    }

    parseTimeLineData(response) {
        return new Promise((resolve, reject) => {
            var timeLineArr = []
            var resObj = JSON.parse(response)
            var hitsJsonObj = resObj['hits']
            var hitsJsonArr = hitsJsonObj['hits']
            for (var index = 0; index < hitsJsonArr.length; index++) {
                var dataJson = hitsJsonArr[index];
                var souJsonObj = dataJson["_source"];
                if (souJsonObj['gatewayId'] ===
                    this.props._selectedGateway['gatewayMacId']
                    && (souJsonObj['starterId'] === this.props.starterMacId)) {
                    var timeLineEvent = new StarterTimeLineEvent(souJsonObj, this.state.motorCount, true)
                    timeLineArr.push(timeLineEvent)
                }
            }
            resolve(timeLineArr)
        })
    }

    fetchTimeLineData() {
        console.log('Fetch Timeline data');
        var URL;
        URL = "http://35.232.180.212:9242/nextaqua_starters/_search";
        return new Promise((resolve, reject) => {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");


            let bodyJson = JSON.stringify(
                this.prepareElasticRequestJson()
            )
            console.log(bodyJson);

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: bodyJson,
                json: true,
                redirect: 'follow'
            };
            fetch(URL, requestOptions)
                .then(response => response.text())
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

    prepareElasticRequestJson() {
        var requestJson = {}
        var queryJson = {}
        requestJson["size"] = 8000
        var sortJSON = []
        var idJSON = {}
        var orderJSON = {}
        orderJSON["order"] = "desc"
        idJSON["id"] = orderJSON
        sortJSON.push(idJSON);
        requestJson["sort"] = sortJSON

        var boolJson = {}
        var mustJson = []

        var mustAllJson = {}
        mustAllJson["match_all"] = {}
        mustJson.push(mustAllJson);
        mustJson.push(this.prepareMatchPharseJson("gatewayId", this.props._selectedGateway['gatewayMacId']));

        const time = this.getTimeInfo()
        var rangeJSON = {}
        var _timestampJSON = {}
        _timestampJSON["gte"] = time['start'] * 1000;
        _timestampJSON["lte"] = time['end'] * 1000;
        _timestampJSON["format"] = "epoch_millis";
        rangeJSON["@timestamp"] = _timestampJSON;
        var jsonObject = {}
        jsonObject["range"] = rangeJSON;

        mustJson.push(jsonObject);

        boolJson["must"] = mustJson;
        queryJson["bool"] = boolJson;
        requestJson["query"] = queryJson;
        return requestJson;
    }

    getTimeInfo() {
        var start
        console.log('Selected data ', this.props._sel_date);

        if (this.props._sel_date !== undefined) {
            start = new Date(this.props._sel_date);
        } else {
            start = new Date()
        }
        start.setHours(0, 0, 0, 0);
        var min = Math.round(start.getTime()) / 1000;
        var max = min + 86400;

        return {
            'start': min,
            'end': max
        }
    }

    prepareMatchPharseJson(typeTag, val) {
        var outerJSonObject = {};
        var matchPhraseJsonObj = {};
        var reqTypeJSonObject = {};
        reqTypeJSonObject["query"] = val
        matchPhraseJsonObj[typeTag] = reqTypeJSonObject
        outerJSonObject["match_phrase"] = matchPhraseJsonObj;
        return outerJSonObject;
    }

}


const mapStateToProps = state => {
    return {
        _selectedGateway: state.gateway['selectedGateway'],
        _starterName: state.main['starterName'],
        _sel_date: state.datepicker['sel_date']
    };
};
const mapDispatchToProps = dispatch => {
    return {
        dispatch,
    };
};

const styles = StyleSheet.create({
    container: {
        width: '95%',
        height: 300,
        // marginTop: 15,
        // backgroundColor: 'rgb(244,247,253)',
        backgroundColor: '#fff',
    },
    text: { margin: 6, fontFamily: 'BrandonText-Regular' },
    spinner: {
        alignSelf: 'center'
    },

    card: {
        width: "90%", marginTop: 20,
        backgroundColor: "#fff", borderRadius: 10,
        shadowColor: '#F1F2F3',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 3,
        padding: 10
    },
    lineNumber: {
        color: '#000', fontSize: 18, fontFamily: 'BrandonText-Bold', fontWeight: '600'
    },
    updateBtn: {
        width: '70%',
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: 'BrandonText-Regular',
        fontSize: 11,
        backgroundColor: "#ffffff",
        borderColor: '#00000040',
        alignSelf: 'center',
        color: '#00000080',
        marginTop: 25,
        elevation: 2
    },
    configEventBg: {
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: "#ffffff",
        borderColor: '#00000040',
        alignSelf: 'center',
        elevation: 2
    },
    welcomeTitle: {
        "opacity": 1,
        "backgroundColor": "rgba(255, 255, 255, 0)",
        "color": "rgba(45, 45, 45, 1)",
        "fontSize": 16,
        "textAlign": "left",
        "width": '100%',
        fontWeight: '600',
        "fontStyle": "normal",
        "fontFamily": "BrandonText-Bold",
    },
    offlineCss: {
        "opacity": 1,
        "color": "#9c9c9c",
        "backgroundColor": "rgba(255, 255, 255, 0)",
        "fontSize": 10,
        bottom: 6,
        "fontStyle": "normal",
        "fontFamily": "BrandonText-Regular",
        "alignSelf": 'flex-end',
        textAlign: 'right',
    },
    "motorCurrent": {
        "opacity": 1,
        "color": "#000",
        "fontSize": 16,
        "fontStyle": "normal",
        fontWeight: '600',
        "fontFamily": "BrandonText-Bold",
        textAlign: 'left'
    },
    "motorReferenceVal": {
        "opacity": 1,
        "color": "#00000080",
        "fontSize": 12,
        "fontStyle": "normal",
        "fontFamily": "BrandonText-Regular",
        textAlign: 'center'
    },
    line: {
        height: '100%',
        borderColor: '#fff',
        opacity: 0.35,
        width: '2%',
        alignSelf: 'flex-end',
        borderLeftWidth: 1
    },
    horizentalline: {
        borderBottomWidth: 1,
        opacity: 0.35,
        borderColor: '#00000080',
    },
    circle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#0071D0'
    },
    emptyCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: 'white',
        borderColor: 'white',
        elevation: 2,
        borderWidth: 1
    },
    row: { flexDirection: 'row' },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StarterTimeLine);