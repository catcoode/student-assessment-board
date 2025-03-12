import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40;

interface CourseChartProps {
  course: {
    code: string;
    name: string;
    gradeDistribution: {
      [key: string]: number;
    };
  };
}

const CourseChart: React.FC<CourseChartProps> = ({ course }) => {
  // Prepare data for the chart

  // Check if gradeDistribution exists
  if (Object.values(course.gradeDistribution).every(value => value === 0)) {
  // if (!course.gradeDistribution) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.courseTitle}>{course.code}: {course.name}</Text>
        <View style={styles.noGradesContainer}>
          <Text style={styles.noGradesText}>No grades yet</Text>
        </View>
      </View>
    );
  }

  const chartData = {
    labels: Object.keys(course.gradeDistribution),
    datasets: [
      {
        data: Object.values(course.gradeDistribution),
      },
    ],
  };

  // @ts-ignore
    return (
    <View style={styles.chartContainer}>
      <Text style={styles.courseTitle}>{course.code}: {course.name}</Text>
      <BarChart
        data={chartData}
        width={screenWidth-40}
        height={220}
        yAxisLabel=" " 
        yAxisSuffix=" "
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
          barPercentage: 1, // Makes the bars thinner (30% of available width)
        }}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    width: screenWidth,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noGradesContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  noGradesText: {
    fontSize: 18,
    color: '#666',
  },
});

export default CourseChart;