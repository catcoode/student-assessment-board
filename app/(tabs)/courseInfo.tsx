import React, { useState, useEffect } from "react";
import { Text, View, FlatList, TextInput, StyleSheet, Dimensions } from "react-native";
import useFetchCollection from "@/hooks/useFetchCollection"; // Hook to fetch students
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;


const CourseList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: courses, loading, error } = useFetchCollection("courses");
  const { data: grades, loading: gradesLoading, error: gradesError } = useFetchCollection("grades");

  const [gradeDistributions, setGradeDistributions] = useState({});



  useEffect(() => {
    if (!courses || !grades || courses.length === 0 || grades.length === 0) return;
    
    console.log("Processing grades:", grades.length, "items");
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
      
      // Extract the course ID from the reference path
      const courseId = grade.courseId;
      
      // Use grade.grade instead of grade.score
      if (distributions[courseId] && grade.grade) {
        // Ensure the grade value is a number between 1-5
        const gradeValue = parseInt(grade.grade);
        if (gradeValue >= 1 && gradeValue <= 5) {
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
              <View style={styles.chartContainer}>
                <Text style={styles.distributionTitle}>Grade Distribution:</Text>
                <BarChart
                  data={{
                    labels: Object.keys(gradeDistributions[item.id]).map(grade => `Grade ${grade}`),
                    datasets: [
                      {
                        data: Object.values(gradeDistributions[item.id]),
                      },
                    ],
                  }}
                  width={screenWidth - 80}
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: '#ffffff', // Sets the chart background to white
                    backgroundGradientFrom: '#ffffff', // Starts the background gradient with white
                    backgroundGradientTo: '#ffffff', // Ends the background gradient with white
                    decimalPlaces: 0, // Shows whole numbers only (no decimal places)
                    color: (opacity = 1) => `rgba(0, 107, 182, ${opacity})`, // Sets bar color to blue with adjustable transparency
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Sets text label color to black
                    style: {
                        borderRadius: 16, // Rounds the corners of the chart area
                    },
                    barPercentage: 0.8, // Makes the bars thinner (30% of available width)
        
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
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
  chartContainer: {
    width: '100%',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
});
