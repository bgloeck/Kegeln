import React, { useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Modal,
  TextInput,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from "./Database";

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [task, setTask] = useState<string>("drücke Button");
  const [taskToDelete, setTaskToDelete] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [tasks, setTasks] = useState<string[]>([]);

  //Lade Übungen von DB beim Start der App & speicher sie in einem Array
  useEffect(() => {
    const loadTasks = async () => {

      const { data, error } = await supabase.from('tasks').select('name');
      if (error) {
        console.log("Failed to loadtasks.",error);
      }

      if (data){
        console.log("loaded data:",data)
        setTasks(data.map((task) => task.name));
      }
    };

    loadTasks();
  }, []);

  //Speichere neue Tasks in DB
  const handleSave = async () => {
    //Überprüfe Eingabe & überspringe leere Eingaben
    if (inputValue.trim() === "") {
      setInputValue("");
      setModalVisible(false);
      return;
    }
    const newTasks = [...tasks, inputValue];
    setTasks(newTasks);
    setTask(inputValue);
    setModalVisible(false);

    const { error } = await supabase.from('tasks').insert({name: inputValue})
    setInputValue("");

    if (error){
      console.error("Failed to save task.", error);
    }
  };

  //Methode zur Löschung einer Übung
  const deleteTask = async () => {

    const { data, error } = await supabase.from('tasks').delete().eq('name', taskToDelete)

    if (error){
      return;
    }
    
    const newTasks = tasks.filter((item) => item !== taskToDelete);
    setTasks(newTasks);
    setDeleteModalVisible(false);
    setTaskToDelete("");
  }
  //Methode, die eine Zufällige Aufgabe zurückgibt
  const getRandomTask = () => {
    if (tasks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tasks.length);
      setTask(tasks[randomIndex]);
    } else {
      setTask("Keine Übungen verfügbar");
    }
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.viewStyle]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.taskView]}>
            <Text style={styles.textStyle}>{task}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
          {(tasks.length > 0) && tasks.map((task, index) => {
            return(
              <View key={index}>
                <TouchableOpacity onLongPress={() => {
                  setTaskToDelete(task || "no task");
                  setDeleteModalVisible(true);
                  }}>
                  <Text style={[isDarkMode ? Colors.lighter : Colors.black, {fontWeight: 'bold', marginTop: "2%"}]}>{task}</Text>
                </TouchableOpacity>
              </View>
          )})}
        </ScrollView>
        <View style={styles.buttonLeiste}>
          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Text style={styles.plusStyle}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={getRandomTask}>
            <Text style={styles.plusStyle}>&gt;</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType='slide'
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, {backgroundColor: isDarkMode ? Colors.darker : Colors.lighter}]}>
            <Text style={[isDarkMode ? Colors.lighter : Colors.darker, {fontWeight: "bold"}]}>{taskToDelete}</Text>
            <Text>wirklich löschen?</Text>
            <View style={styles.deleteButtonView}>
              <TouchableOpacity style={[styles.modalButtons, {backgroundColor:"red"}]} onPress={() => {deleteTask()}}>
                <Text>Löschen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButtons, {backgroundColor:"green"}]} onPress={() => {setDeleteModalVisible(false)}}>
                <Text>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, {backgroundColor: isDarkMode ? Colors.darker : Colors.lighter}]}>
            <Text style={isDarkMode ? Colors.lighter : Colors.darker}>Gib eine Übung ein:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setInputValue}
              value={inputValue}
              placeholder="Übung"
              placeholderTextColor={isDarkMode ? Colors.lighter : Colors.darker}
              multiline={true}
            />
            <View style={styles.deleteButtonView}>
              <TouchableOpacity style={[styles.modalButtons, {backgroundColor:"green"}]} onPress={handleSave} >
                <Text>Speichern</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButtons, {backgroundColor:"red"}]} onPress={() => setModalVisible(false)} >
                <Text>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center'
  },
  header: {
    backgroundColor: "green",
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center'
  },
  taskView: {
    backgroundColor: "white",
    marginTop: "15%",
    marginBottom: "5%",
    paddingLeft: "2.5%",
    paddingRight: "2.5%",
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textStyle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "black"
  },
  scrollViewContent: {
    alignItems: 'center',
    minWidth: "80%",
  },
  scrollView: {
    marginTop: "5%",
    marginBottom: "20%",
    minWidth: "80%",
  },
  buttonLeiste: {
    position: 'absolute',
    bottom: '2%',
    marginLeft: "1%",
    marginRight: "5%",
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'green',
    padding: 10,
    width: "98%",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  button: {
    width: "50%",
    alignItems: "center"
  },
  plusStyle: {
    fontSize: 20,
    fontWeight: "bold"
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 10,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteButtonView:{
    flexDirection: "row",
    gap: 6
  },
  modalButtons: {
    width: "50%",
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 50,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  input: {
    minHeight: 40,
    minWidth: "100%",
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    width: '100%',
    paddingHorizontal: 10,
  },
});

export default App;
