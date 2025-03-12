import React, { useState, useEffect } from "react";
import {Text, View, FlatList, TextInput, StyleSheet, TouchableOpacity, Modal, Alert} from "react-native";
import useFetchCollection from "@/hooks/useFetchCollection"; // Hook to fetch students
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { updateCourse, deleteCourse } from "@/firebase/courseService"; // Import the updateCourse and deleteCourse functions
import { CourseProps } from "@/components/Course"; // Import the CourseProps type
import firebase from "firebase/compat";
import DocumentData = firebase.firestore.DocumentData;
// import {Property} from "csstype";
// import ColumnRule = Property.ColumnRule;


interface Course extends CourseProps {
  id: string;
}


// Attributes
const CourseList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: courses, loading, error } = useFetchCollection<Course>("courses");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<{id: string} & CourseProps | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: ""
  });
  const [courseData, setCourseData] = useState<DocumentData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use the initial data from useFetchCollection
  useEffect(() => {
    if (courses) {
      setCourseData(courses);
    }
  }, [courses]);

  // Function to manually refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const coursesCollection = collection(db, "courses");
      const querySnapshot = await getDocs(coursesCollection);
      const fetchedCourses: Course[] = querySnapshot.docs.map(doc => ({
        id: doc.id,  // Ensure id is included
        ...(doc.data() as Omit<Course, "id">) // Type assertion
      }));

      setCourseData(fetchedCourses);
    } catch (error) {
      console.error("Error refreshing courses:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading && courseData.length === 0) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (isRefreshing) return <Text>Refreshing data...</Text>;

  const filteredCourses: Course[] = courseData.filter(
      (course): course is Course =>
          typeof course.code === "string" &&
          typeof course.name === "string" &&
          (course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
              course.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );


  const handleEditPress = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description
    });
    setIsEditModalVisible(true);
  };

  const handleDeletePress = (course: CourseProps & { id: string }) => {
    // Show confirmation dialog
    Alert.alert(
        "Delete Course",
        `Are you sure you want to delete the course "${course.name}"?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              const deleted = await deleteCourse(course.id);
              if (deleted) {
                // Refresh the data after successful deletion
                refreshData();
              } else {
                // Handle error
                Alert.alert("Error", "Failed to delete course");
              }
            }
          }
        ]
    );
  };

  const handleSaveEdit = async () => {
    if (editingCourse) {
      const updated = await updateCourse(editingCourse.id, formData);
      if (updated) {
        // Close the modal and refresh the data
        setIsEditModalVisible(false);
        if (refreshData) refreshData();
      } else {
        // Handle error (you could add more sophisticated error handling)
        alert("Failed to update course");
      }
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
      <View style={styles.container}>
        <TextInput
            style={styles.searchBar}
            placeholder="Search by course code or name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
        />

        <FlatList
            data={filteredCourses}
            keyExtractor={(item: CourseProps & { id: string }) => item.id}
            contentContainerStyle={styles.listContainer}
            onRefresh={refreshData}
            refreshing={isRefreshing}
            renderItem={({ item }) => (
                <View style={styles.courseCard}>
                  <Text style={styles.courseName}>{item.code}</Text>
                  <Text style={styles.courseName}>{item.name}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditPress(item)}
                    >
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeletePress(item)}
                    >
                      <Text style={styles.buttonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
            )}
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
              <Text style={styles.modalTitle}>Edit Course</Text>

              <Text style={styles.inputLabel}>Course Code:</Text>
              <TextInput
                  style={styles.input}
                  value={formData.code}
                  onChangeText={(text) => handleInputChange("code", text)}
              />

              <Text style={styles.inputLabel}>Course Name:</Text>
              <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange("name", text)}
              />

              <Text style={styles.inputLabel}>Description:</Text>
              <TextInput
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                  value={formData.description}
                  onChangeText={(text) => handleInputChange("description", text)}
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

export default CourseList;

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
  courseCard: {
    width: 350,
    backgroundColor: "#f0f0f0",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "blue",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginTop: 5,
  },
  editButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: "center",
  },
  buttonText: {
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
});