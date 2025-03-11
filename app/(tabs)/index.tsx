import { Image, StyleSheet, Platform, FlatList, TextInput, Button } from 'react-native';
import { useState } from "react";
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { addStudent } from '@/firebase/studentService'; // Import the addStudent function

export default function HomeScreen() {
    // State to store student data
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentDateOfBirth, setStudentDateOfBirth] = useState('');

    // Function to handle form submission
    const handleAddStudent = async () => {
        const newStudent = {
            studentName,
            email: studentEmail,
            dateOfBirth: new Date(studentDateOfBirth),
            courses: [], // Empty array to hold courses
        };

        // Call addStudent to add the new student to Firestore
        await addStudent(newStudent);

        // Reset the input fields after submission
        setStudentName('');
        setStudentEmail('');
        setStudentDateOfBirth('');
    };


    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/partial-react-logo.png')}
                    style={styles.reactLogo}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Welcome!</ThemedText>
                <HelloWave />
            </ThemedView>

            {/* Form to add a new student */}
            <ThemedView style={styles.stepContainer}>
                <TextInput
                    placeholder="Student Name"
                    value={studentName}
                    onChangeText={setStudentName}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Email"
                    value={studentEmail}
                    onChangeText={setStudentEmail}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Date of Birth (YYYY-MM-DD)"
                    value={studentDateOfBirth}
                    onChangeText={setStudentDateOfBirth}
                    style={styles.input}
                />

                <Button title="Add Student" onPress={handleAddStudent} />
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
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
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 8,
        marginBottom: 8,
    },
});
