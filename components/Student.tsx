import { View, Text, StyleSheet } from 'react-native';

export type StudentProps = {
    firstName: string;
    lastName: string;
    email: string;
};

export default function Student({ firstName, lastName, email }: StudentProps) {
    // @ts-ignore
    return (
        <View style={styles.StudentContainer}>
            <Text style={styles.studentName}>{firstName}</Text>
            <Text style={styles.studentName}>{lastName}</Text>
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
    email: {
        fontSize: 12,
        color: 'blue',
    },

});
