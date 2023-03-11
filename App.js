import { StatusBar } from 'expo-status-bar';
import { Alert, Button, Platform, StyleSheet, Text, View } from 'react-native';

import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowAlert: true
    }
  }
})

export default function App() {
  const [notification, setNotification] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  
  useEffect(() => {
    async function configureNotification() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permissions Required', 'Cannot proceed without appropriate permissions');
        return;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      console.log(pushTokenData);
      setExpoPushToken(pushTokenData);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT
        })
      }
    }

    configureNotification();
  }, [])
  
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification recieved");
      console.log(notification);
    })

    const subscription2 = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
      setNotification(response.notification);
    })

    return () => {
      subscription.remove();
      subscription2.remove();
    }
  }, [])
  
  //This can be used for local notifications like alarm and todo
  
  // function scheduleNotificationHandler() {
  //   Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: 'Its a Notification',
  //       body: 'This is a customized notification for testing',
  //       data: { url: 'www.abc.com'}
  //     },
  //     trigger: {
  //       seconds: 3
  //     },
  //   })
  // }

  function sendPushNotificationHandler() {
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: `${expoPushToken.data}`,
        title: 'Its a push notification',
        body: 'This is also a customized notification for testing',
        data: {url: 'www.abc.com'}
      })
    })
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.pushToken}>
        <Text>Your unique expo push token is</Text>
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>{expoPushToken.data}</Text>
        </View>
      </View>
      <View style={styles.payload}>
        <Text>Your payload or extra data</Text>
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>{notification && notification.request.content.data.url}</Text>
        </View>
      </View>
      <View style={styles.button}>
        <Button title='Schedule Notification' color={'black'} onPress={sendPushNotificationHandler} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  pushToken: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  payload: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dataContainer: {
    borderWidth: 2,
    borderColor: 'black',
    width: 300,
    padding: 10,
    margin: 10
  },
  dataText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 12
  }
});
