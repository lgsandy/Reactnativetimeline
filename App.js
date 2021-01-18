import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import Dash from 'react-native-dash';

const renderTimeLineObjs = (motorData) => {
  console.log(motorData[0]);
  return (
    <View
      style={{flexDirection: 'row', width: '100%', alignContent: 'flex-start'}}>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 5,
          marginLeft: -3,
        }}>
        <View style={{...styles.horizentalline, width: '10%', bottom: 9}} />

        <Text
          style={{
            width: '5%',
            ...styles.updateBtn,

            textAlign: 'center',
            justifyContent: 'center',
          }}>
          {motorData[0].voltage}
        </Text>
        <View style={{...styles.horizentalline, width: '10%', bottom: 9}} />
        <Text
          style={{
            width: '5%',
            ...styles.updateBtn,
            ...motorData[1].motorBgStyle,
            textAlign: 'center',
            justifyContent: 'center',
            borderStyle: 'dotted',
          }}>
          {motorData[1].currentVal}
        </Text>
        <View style={{...styles.horizentalline, width: '10%', bottom: 9}} />
        <Text
          style={{
            width: '5%',
            ...styles.updateBtn,
            ...motorData['pillStyleInfo'],
            textAlign: 'center',
            justifyContent: 'center',
            borderStyle: 'dotted',
          }}>
          {motorData[2].currentVal}
        </Text>
      </View>
    </View>
  );
};

const renderTimeLineEventCapsule = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        marginTop: 5,
        marginLeft: -3,
      }}>
      <View style={{...styles.horizentalline, width: '10%', bottom: 9}} />

      <Text
        style={{
          width: '5%',
          ...styles.updateBtn,

          textAlign: 'center',
          justifyContent: 'center',
        }}>
        currentVal
      </Text>
      <View style={{...styles.horizentalline, width: '10%', bottom: 9}} />
      <Text
        style={{
          width: '5%',
          ...styles.updateBtn,

          textAlign: 'center',
          justifyContent: 'center',
        }}>
        currentVal
      </Text>
      <View style={{...styles.horizentalline, width: '10%', bottom: 9}} />
      <Text
        style={{
          width: '5%',
          ...styles.updateBtn,

          textAlign: 'center',
          justifyContent: 'center',
        }}>
        currentVal
      </Text>
    </View>
  );
};

const App = () => {
  const jsonData = [
    {
      isTimeLine: true,
      faultMsg: '',
      id: '1610518673',
      epochTime: '1610518673',
      time: '11:47',
      motorData: [
        {
          voltage: 442,
          motor: false,
        },
        {
          motorIndication: 'M1',
          currentVal: 0,
          mode: 0,
          status: 0,
          update: 0,
          motor: true,
          motorBgStyle: {
            color: '#f4c900',
            fontFamily: 'BrandonText-Regular',
          },
        },
        {
          motorIndication: 'M2',
          currentVal: 0,
          mode: 0,
          status: 0,
          update: 0,
          motor: true,
          motorBgStyle: {
            color: '#f4c900',
            fontFamily: 'BrandonText-Regular',
          },
        },
      ],
      faultId: null,
      pktType: 'V',
      vtgPhaseFault: 0,
      pillStyleInfo: {
        backgroundColor: '#ffffff',
        borderColor: '#00000040',
        color: '#00000080',
      },
    },
    {
      isTimeLine: true,
      faultMsg: '',
      id: '1610518071',
      epochTime: '1610518071',
      time: '11:37',
      motorData: [
        {
          voltage: 442,
          motor: false,
        },
        {
          motorIndication: 'M1',
          currentVal: 0,
          mode: 0,
          status: 0,
          update: 0,
          motor: true,
          motorBgStyle: {
            color: '#f4c900',
            fontFamily: 'BrandonText-Regular',
          },
        },
        {
          motorIndication: 'M2',
          currentVal: 0,
          mode: 0,
          status: 0,
          update: 0,
          motor: true,
          motorBgStyle: {
            color: '#f4c900',
            fontFamily: 'BrandonText-Regular',
          },
        },
      ],
      faultId: null,
      pktType: 'V',
      vtgPhaseFault: 0,
      pillStyleInfo: {
        backgroundColor: '#ffffff',
        borderColor: '#00000040',
        color: '#00000080',
      },
    },
  ];
  return (
    <View style={styles.card}>
      <View
        style={{
          width: '100%',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
        <Text
          style={{marginTop: 10, fontFamily: 'BrandonText-Bold', fontSize: 18}}>
          Time Line
        </Text>
        <View
          style={{
            flexDirection: 'row',
            padding: 5,
            borderTopWidth: 1,
            borderTopColor: 'gray',
          }}>
          <TouchableOpacity
            style={{
              marginLeft: -10,
              borderRadius: 10,
              borderColor: 'gray',
              borderWidth: 1,
              padding: 2,
            }}>
            <Text style={{fontSize: 12}}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={{fontSize: 12}}>Configration </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={{fontSize: 12}}>Power & Voltage Fault </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={{fontSize: 12}}>Current Fault </Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', marginBottom: -23}}>
          <Text>Time</Text>
          <Text style={{marginLeft: 30}}>Voltage</Text>
          <Text style={{marginLeft: 60}}>M1</Text>
          <Text style={{marginLeft: 75}}>M2</Text>
        </View>
        <View style={{flexDirection: 'column', paddingBottom: 10}}>
          {jsonData.map((y) => {
            return (
              <View
                key={y.time}
                style={{width: '100%', flexDirection: 'row', top: 10}}>
                <Text
                  style={{
                    alignSelf: 'flex-end',
                    width: '15%',
                    bottom: 3,
                  }}>
                  {y.time}
                </Text>

                <View style={{width: '2%', height: 50}}>
                  <Dash
                    style={{height: 25, flexDirection: 'column'}}
                    dashLength={3}
                    dashColor={'#78787840'}
                  />
                  <View
                    style={{
                      ...styles.emptyCircle,
                      top: 5,
                      alignContent: 'flex-start',
                      left: -5,
                    }}>
                    <View
                      style={{...styles.circle, alignSelf: 'center', top: 2}}
                    />
                  </View>
                </View>
                <View style={{width: '100%', alignContent: 'flex-start'}}>
                  {renderTimeLineObjs(y.motorData)}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    marginLeft: 5,
    borderRadius: 10,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 2,
  },
  container: {
    width: '95%',
    height: 300,
    // marginTop: 15,
    // backgroundColor: 'rgb(244,247,253)',
    backgroundColor: '#fff',
  },
  text: {margin: 6, fontFamily: 'BrandonText-Regular'},
  spinner: {
    alignSelf: 'center',
  },

  card: {
    width: '90%',
    margin: 17,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#F1F2F3',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    padding: 10,
  },
  lineNumber: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'BrandonText-Bold',
    fontWeight: '600',
  },
  updateBtn: {
    width: '20%',
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'BrandonText-Regular',
    fontSize: 11,
    backgroundColor: '#ffffff',
    borderColor: '#00000040',
    alignSelf: 'center',
    color: '#00000080',
    marginTop: 25,
    elevation: 2,
  },
  configEventBg: {
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    borderColor: '#00000040',
    alignSelf: 'center',
    elevation: 2,
  },
  welcomeTitle: {
    opacity: 1,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    color: 'rgba(45, 45, 45, 1)',
    fontSize: 16,
    textAlign: 'left',
    width: '100%',
    fontWeight: '600',
    fontStyle: 'normal',
    fontFamily: 'BrandonText-Bold',
  },
  offlineCss: {
    opacity: 1,
    color: '#9c9c9c',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    fontSize: 10,
    bottom: 6,
    fontStyle: 'normal',
    fontFamily: 'BrandonText-Regular',
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
  motorCurrent: {
    opacity: 1,
    color: '#000',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '600',
    fontFamily: 'BrandonText-Bold',
    textAlign: 'left',
  },
  motorReferenceVal: {
    opacity: 1,
    color: '#00000080',
    fontSize: 12,
    fontStyle: 'normal',
    fontFamily: 'BrandonText-Regular',
    textAlign: 'center',
  },
  line: {
    height: '100%',
    borderColor: '#fff',
    opacity: 0.35,
    width: '2%',
    alignSelf: 'flex-end',
    borderLeftWidth: 1,
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
    backgroundColor: '#0071D0',
  },
  emptyCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'white',
    borderColor: 'white',
    elevation: 2,
    borderWidth: 1,
  },
  row: {flexDirection: 'row'},
});
export default App;
