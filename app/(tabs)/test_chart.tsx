import React, { useState } from 'react'; 
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';

import CourseChart from '../../components/CourseChart'; // Import the component

// constants/courseData.js

export const COURSES = [
    {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        gradeDistribution: {
            'A': 25, // number of students who got A
            'B': 35,
            'C': 20,
            'D': 15,
            'F': 5
        }
    },
    {
        code: 'CS201',
        name: 'Data Structures and Algorithms',
        gradeDistribution: {
            'A': 20,
            'B': 30,
            'C': 25,
            'D': 15,
            'F': 10
        }
    },
    {
        code: 'CS340',
        name: 'Mobile App Development',
        gradeDistribution: {
            'A': 30,
            'B': 40,
            'C': 20,
            'D': 8,
            'F': 2
        }
    },
    {
        code: 'CS330',
        name: 'Database Systems',
        gradeDistribution: {
            'A': 15,
            'B': 35,
            'C': 30,
            'D': 15,
            'F': 5
        }
    },
    {
        code: 'CS530',
        name: 'Data Structures and Algorithms',
        gradeDistribution: {
          'A': 0,
          'B': 0,
          'C': 0,
          'D': 0,
          'F': 0
      }
    },
    {
        code: 'CS450',
        name: 'Artificial Intelligence',
        gradeDistribution: {
            'A': 18,
            'B': 32,
            'C': 28,
            'D': 12,
            'F': 10
        }
    }
];



export default function TestChartScreen() {

      const [searchText, setSearchText] = useState('');
    return (
    <View style={styles.container}>
      <Text style={styles.title}>Chart Test Screen</Text>

      <TextInput style={styles.input} placeholder="Search courses..." value={searchText} onChangeText={setSearchText} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {COURSES.map(course => (
          <CourseChart key={course.code} course={course} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
    scrollContainer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 16,
        backgroundColor: '#fff',
      },
});