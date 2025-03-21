import React, { useState } from "react";
import { Text, View, FlatList, TextInput, StyleSheet, Modal, TouchableOpacity } from "react-native";
import useFetchCollection from "@/hooks/useFetchCollection";
import { updateStudent } from "@/firebase/studentService";
import { StudentProps } from "@/components/Student";
import { Alert } from "react-native";
import { deleteStudent } from "@/firebase/studentService";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const StudentsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: students, loading, error, refetch } = useFetchCollection<Student>("students");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProps & { id: string } | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing students:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditPress = (student: StudentProps & { id: string }) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    });
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (editingStudent) {
      try {
        await updateStudent(editingStudent.id, formData);
        setIsEditModalVisible(false);
        handleRefresh();
      } catch (error: any) {
        alert("Failed to update student: " + error.message);
      }
    }
  };

  const handleDeletePress = (student: StudentProps & { id: string }) => {
    Alert.alert(
        "Delete student",
        `Are you sure you want to delete the student "${student.firstName} ${student.lastName}"?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              const deleted = await deleteStudent(student.id);
              if (deleted) {
                handleRefresh();
              } else {
                Alert.alert("Error", "Failed to delete student");
              }
            }
          }
        ]
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && !isRefreshing) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const filteredStudents = students
      ? students.filter(student =>
          student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : [];

  return (
      <View style={styles.container}>
        <TextInput
            style={styles.searchBar}
            placeholder="Search by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
        />

        <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
                <View style={styles.studentCard}>
                  <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.studentEmail}>{item.email}</Text>
                  <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditPress(item)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeletePress(item)}
                  >
                    <Text style={styles.buttonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
            )}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
        />

        {/* Edit Modal */}
        <Modal
            visible={isEditModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Student</Text>

              <Text style={styles.inputLabel}>Student first name:</Text>
              <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange("firstName", text)}
              />

              <Text style={styles.inputLabel}>Student last name:</Text>
              <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange("lastName", text)}
              />

              <Text style={styles.inputLabel}>Email:</Text>
              <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange("email", text)}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setIsEditModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSaveEdit}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
  );
};

export default StudentsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
    width: "100%"
  },
  searchBar: {
    width: "90%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "white",
    marginBottom: 20,
  },
  listContainer: {
    alignItems: "center",
    width: "100%",
  },
  studentCard: {
    width: 350,
    backgroundColor: "#f0f0f0",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  studentEmail: {
    fontSize: 14,
    color: "blue",
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 5,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputLabel: {
    alignSelf: "flex-start",
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ff6b6b",
  },
  saveButton: {
    backgroundColor: "#4ecdc4",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: "center",
  },
});