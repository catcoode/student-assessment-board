import { View, Text, StyleSheet } from 'react-native';

export type CourseProps = {
    courseName: string;
    courseCode: string;
    courseDescription: string;
    credits: number;
    teacherName: string;
};