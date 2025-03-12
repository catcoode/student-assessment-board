import { Image, StyleSheet, TextInput, Button, View , Text} from 'react-native';
import { useEffect, useState } from "react";
import { Picker } from '@react-native-picker/picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { addGrade } from '@/firebase/gradeService';
import { getStudents } from '@/firebase/studentService';
import { getCourses } from '@/firebase/courseService';

export default function GradeScreen() {
    // State for grade input
    const [grade, setGrade] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');

    // State to store students & courses
    const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
    const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

// Fetch students and courses from Firestore
    useEffect(() => {
        const fetchData = async () => {
            const studentsData = await getStudents();
            const coursesData = await getCourses();

            setStudents(studentsData);
            setCourses(coursesData);
        };

        fetchData();
    }, []);


    // Function to handle adding a grade
    const handleAddGrade = async () => {
        if (!grade || !selectedStudentId || !selectedCourseId) {
            alert("Please fill all fields!");
            return;
        }

        const newGrade = {
            grade: parseFloat(grade), // Convert grade to number
            studentId: selectedStudentId,
            courseId: selectedCourseId,
        };

        await addGrade(newGrade);

        // Reset input fields
        setGrade('');
        setSelectedStudentId('');
        setSelectedCourseId('');
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}
            headerImage={
                <Image
                    source={require('@/assets/images/partial-react-logo.png')}
                    style={styles.reactLogo}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Add Grade</ThemedText>
            </ThemedView>

            {/* Form to add a grade */}
            <ThemedView style={styles.stepContainer}>
                {/* Grade Input */}
                <TextInput
                    placeholder="Grade"
                    value={grade}
                    onChangeText={setGrade}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                />

                {/* Student Dropdown */}
                <Picker
                    selectedValue={selectedStudentId}
                    onValueChange={(itemValue) => setSelectedStudentId(itemValue)}
                    mode="dropdown"
                    itemStyle={{backgroundColor:'white', color:'black', margin:10}}
                >
                    <Picker.Item label="Select Student" value="" />
                    {students.map(student => (
                        <Picker.Item key={student.id} label={student.name} value={student.id}/>
                    ))}
                </Picker>

                {/* Course Dropdown */}
                <Picker
                    selectedValue={selectedCourseId}
                    onValueChange={(itemValue) => setSelectedCourseId(itemValue)}
                    mode="dropdown"
                    itemStyle={{backgroundColor:'white', color:'black', margin:10}}
                >
                    <Picker.Item label="Select Course" value=""/>
                    {courses.map(course => (
                        <Picker.Item key={course.id} label={course.title} value={course.id}/>
                    ))}
                </Picker>

                {/* Submit Button */}
                <Button title="Add Grade" onPress={handleAddGrade}/>
            </ThemedView>
        </ParallaxScrollView>
    );
}
    const styles = StyleSheet.create({
        titleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 16,
            paddingTop: 16,
        },
        stepContainer: {
            gap: 8,
            marginBottom: 16,
            padding: 16,
        },
        reactLogo: {
            height: 178,
            width: 290,
            bottom: 0,
            left: 0,
            position: 'absolute',
        },
        input: {
            height: 100,
            borderColor: '#ddd',
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            color: 'black',
            fontSize: 20,
            backgroundColor: 'white',
        },
        label: {
            fontSize: 16,
            fontWeight: '500',
            marginBottom: 8,
            marginTop: 8,
        },
        picker: {
            height: 50,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            marginBottom: 16,
        }
    });