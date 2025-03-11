import { View, Text, StyleSheet } from 'react-native';

export type StudentProps = {
    studentName: string;
    dateOfBirth: Date;
    email: string;
    courses?: string[];
};

export default function Student({ studentName, dateOfBirth, email }: StudentProps) {
    // @ts-ignore
    return (
        <View style={styles.StudentContainer}>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.email}>{email}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    StudentContainer: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    dateOfBirth: {
        fontSize: 14,
        marginVertical: 5,
    },
    email: {
        fontSize: 12,
        color: 'blue',
    },

});
