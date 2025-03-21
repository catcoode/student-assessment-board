import React, { useState, useEffect } from "react";
import {Text, View, FlatList, TextInput, StyleSheet, TouchableOpacity, Modal, Alert, Dimensions } from "react-native";
import { updateCourse, deleteCourse } from "@/firebase/courseService"; // Import the updateCourse and deleteCourse functions
import { CourseProps } from "@/components/Course"; // Import the CourseProps type
import { BarChart } from "react-native-chart-kit";
import useFetchCollection from "@/hooks/useFetchCollection"; // Hook to fetch students

// interfaces for proper initalization of variables
interface Course extends CourseProps {
  id: string;
}

interface Grade {
  id: string;
  courseId: string;
  grade: string;
}

interface GradeDistribution {
  [grade: number]: number;
}

type GradeDistributions = Record<string, GradeDistribution>; // Course ID mapped to grade distributions

const screenWidth = Dimensions.get("window").width; // get window width for graph width

// main function
const CourseList = () => {
  // hooks
  const [searchQuery, setSearchQuery] = useState("");
  const { data: courses, loading, error, refetch: refetchCourses } = useFetchCollection<Course>("courses");
  const { data: grades, loading: gradesLoading, error: gradesError, refetch: refetchGrades } = useFetchCollection<Grade>("grades");
  const [gradeDistributions, setGradeDistributions] = useState<GradeDistributions>({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<{id: string} & CourseProps | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: ""
  });

  // UseEffect hook for calculating the grad distribution
  useEffect(() => {
    if (!courses || !grades || courses.length === 0 || grades.length === 0) return;

    console.log("Processing grades:", grades.length, "items");
    const distributions: Record<string, Record<number, number>> = {};

    courses.forEach(course => {
      distributions[course.id] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}; // structuring list
    });

    grades.forEach(grade => {
      if (!grade.courseId) { // no course id
        console.log('Found grade without courseId:', grade);
        return;
      }

      const courseId = grade.courseId;

      if (distributions[courseId] && grade.grade) {
        const gradeValue = parseInt(grade.grade);
        if (gradeValue >= 1 && gradeValue <= 5) { // calculating the grade distribution
          distributions[courseId][gradeValue] =
              (distributions[courseId][gradeValue] || 0) + 1;
        } else {
          console.log(`Invalid grade value: ${grade.grade} for course ${courseId}`);
        }
      } else if (!distributions[courseId]) {
        console.log(`Course ID not found: ${courseId}`);
      } else if (!grade.grade) {
        console.log(`Missing grade value for entry:`, grade);
      }
    });

    console.log("Grade distributions:", distributions);
    setGradeDistributions(distributions);
  }, [courses, grades]);

  // Function to refresh courses and grades data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Using the refetch methods from the hooks to refresh data
      await Promise.all([refetchCourses(), refetchGrades()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // conditionals
  if (loading || gradesLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (gradesError) return <Text>Error loading grades: {gradesError.message}</Text>;

  const filteredCourses = courses.filter(
      (course) =>
          (course.code.toLowerCase().includes(searchQuery.toLowerCase()) || course.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
        refreshData();
      } else {
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
            placeholderTextColor="#666"
        />

        <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            onRefresh={refreshData}
            refreshing={isRefreshing}
            renderItem={({ item }) => (
                <View style={styles.courseCard}>
                  <Text style={styles.courseName}>{item.code}</Text>
                  <Text style={styles.courseName}>{item.name}</Text>
                  <Text style={styles.description}>{item.description}</Text>

                  {gradeDistributions[item.id] && (
                      <View style={styles.chartContainer}>
                        <Text style={styles.distributionTitle}>Grade Distribution:</Text>
                        <BarChart
                            data={{
                              labels: Object.keys(gradeDistributions[item.id]).map(grade => `${grade}`),
                              datasets: [
                                {
                                  data: (() => {
                                    const gradeCounts = Object.values(gradeDistributions[item.id]);
                                    const total = gradeCounts.reduce((sum, count) => sum + count, 0);

                                    // Convert counts to percentages
                                    return gradeCounts.map(count => total > 0 ? (count / total) * 100 : 0);
                                  })(),
                                },
                              ],
                            }}
                            width={screenWidth - 40}
                            height={200}
                            yAxisLabel=""
                            yAxisSuffix="%"
                            chartConfig={{
                              backgroundColor: '#ffffff',
                              backgroundGradientFrom: '#ffffff',
                              backgroundGradientTo: '#ffffff',
                              decimalPlaces: 1, // Show one decimal place for percentages
                              color: (opacity = 1) => `rgba(0, 100, 180, ${opacity})`,
                              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                              style: {
                                borderRadius: 16,
                              },
                              barPercentage: 1,
                            }}
                            style={{
                              marginVertical: 8,
                              borderRadius: 16,
                            }}
                        />
                      </View>
                  )}


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
    width: "100%",
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
  distributionContainer: {
    width: '100%',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  distributionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gradesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  gradeItem: {
    alignItems: 'center',
    minWidth: 30,
    marginHorizontal: 5,
  },
  gradeValue: {
    fontWeight: 'bold',
  },
  gradeCount: {
    color: '#666',
  },
  chartContainer: {
    width: '100%',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
});