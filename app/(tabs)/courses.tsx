import { Image, StyleSheet, TextInput, Button } from 'react-native';
import { useState } from "react";
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { addCourse } from '@/firebase/courseService'; // Import the addStudent function

export default function CourseScreen() {
    // State to store student data
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');


    // Function to handle form submission
    // Function to handle form submission for adding a course
    const handleAddCourse = async () => {
        const newCourse = {
            name,
            code,
            description,
        };

        // Call addCourse to add the new course to Firestore
        await addCourse(newCourse);

        // Reset the input fields after submission
        setName('');
        setCode('');
        setDescription('');
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
                <ThemedText type="title">Add Courses</ThemedText>
                <HelloWave />
            </ThemedView>


            {/* Form to add a new course */}
            <ThemedView style={styles.stepContainer}>
                <TextInput
                    placeholder="Course Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    placeholderTextColor="#666"
                />
                <TextInput
                    placeholder="Course Code"
                    value={code}
                    onChangeText={setCode}
                    style={styles.input}
                    placeholderTextColor="#666"
                />
                <TextInput
                    placeholder="Course Description"
                    value={description}
                    onChangeText={setDescription}
                    style={styles.input}
                    placeholderTextColor="#666"
                />
                <Button title="Add Course" onPress={handleAddCourse} />
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
        backgroundColor: "white"
    },
});
