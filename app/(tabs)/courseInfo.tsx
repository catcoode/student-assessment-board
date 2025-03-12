import React, { useState, useEffect } from "react";
import { Text, View, FlatList, TextInput, StyleSheet } from "react-native";
import useFetchCollection from "@/hooks/useFetchCollection"; // Hook to fetch students

const CourseList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: courses, loading, error } = useFetchCollection("courses");
  const { data: grades, loading: gradesLoading, error: gradesError } = useFetchCollection("grades");

  const [gradeDistributions, setGradeDistributions] = useState({});



  useEffect(() => {
    if (!courses || !grades || courses.length === 0 || grades.length === 0) return;
    
    const distributions = {};
    
    // Initialize distributions for each course
    courses.forEach(course => {
      distributions[course.id] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    });
    
    // Count grades for each course
    grades.forEach(grade => {
      // Skip grades with missing courseId
      if (!grade.courseId) {
        console.log('Found grade without courseId:', grade);
        return; // Skip this grade
      }
      
      // Extract the course ID from the reference path - more safely
      let courseId;
      
      if (typeof grade.courseId === 'string') {
        // Handle string references like "/courses/TUF5EmrC6722vgwlw23F"
        const parts = grade.courseId.split('/');
        courseId = parts[parts.length - 1]; // Get the last part
      } else if (grade.courseId && typeof grade.courseId === 'object') {
        // Handle object references
        courseId = grade.courseId.id;
      } else {
        // Unknown format - log and skip
        console.log('Unrecognized courseId format:', grade.courseId);
        return;
      }
      
      if (distributions[courseId] && grade.score) {
        distributions[courseId][grade.score] = 
          (distributions[courseId][grade.score] || 0) + 1;
      }
    });
    
    setGradeDistributions(distributions);
  }, [courses, grades]);






  if (loading || gradesLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (gradesError) return <Text>Error loading grades: {gradesError.message}</Text>;

  const filteredcourses = courses.filter(course =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by course code or name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredcourses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <Text style={styles.studentName}>{item.code}</Text>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.email}>{item.description}</Text>



            {gradeDistributions[item.id] && (
              <View style={styles.distributionContainer}>
                <Text style={styles.distributionTitle}>Grade Distribution:</Text>
                <View style={styles.gradesRow}>
                  {Object.entries(gradeDistributions[item.id]).map(([grade, count]) => (
                    <View key={grade} style={styles.gradeItem}>
                      <Text style={styles.gradeValue}>{grade}</Text>
                      <Text style={styles.gradeCount}>{count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}



          </View>
        )}
      />
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
  studentCard: {
    width: 350, // ✅ Adjusted width to 80% of screen
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
  email: {
    fontSize: 14,
    color: "blue",
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
});
