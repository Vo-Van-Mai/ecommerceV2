import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { MyUserContext } from '../../configs/Context';
import { authAPI, endpoints } from '../../configs/Apis';
import { formatCurrency } from '../../utils/PriceUtils';

const Statistics = ({ route, navigation }) => {
    const user = useContext(MyUserContext);
    const shopId = route?.params?.shopId;
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [periodType, setPeriodType] = useState('month');
    const [year, setYear] = useState(new Date().getFullYear());

    const years = Array.from(
        { length: 5 }, 
        (_, i) => new Date().getFullYear() - i
    );

    useEffect(() => {
        if (!user || !shopId) {
            console.log("Không có thông tin user hoặc shopId");
            return;
        }
        loadStatistics();
    }, [periodType, year, user, shopId]);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            console.log("Loading stats for shop:", shopId);
            
            let url = `${endpoints['revenue-stats'](shopId, periodType)}`;
            const params = new URLSearchParams();
            params.append('year', year);
            url += `?${params.toString()}`;

            console.log("Calling API:", url);
            const res = await authAPI(user.token).get(url);
            console.log("API Response:", res.data);
            setStats(res.data);
        } catch (error) {
            console.error("Lỗi lấy thống kê:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatistics();
    }, [periodType, year]);

    const renderYearSelector = () => (
        <View style={styles.yearSelector}>
            {years.map((y) => (
                <TouchableOpacity
                    key={y}
                    style={[
                        styles.yearButton,
                        year === y && styles.activeYearButton
                    ]}
                    onPress={() => setYear(y)}
                >
                    <Text style={[
                        styles.yearText,
                        year === y && styles.activeYearText
                    ]}>
                        {y}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderStatisticsTable = () => {
        if (!stats?.statistics?.length) {
            return (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>Không có dữ liệu thống kê</Text>
                </View>
            );
        }

        return (
            <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, { flex: 2 }]}>Thời gian</Text>
                    <Text style={[styles.headerCell, { flex: 3 }]}>Doanh thu</Text>
                    <Text style={[styles.headerCell, { flex: 2 }]}>Số đơn</Text>
                    <Text style={[styles.headerCell, { flex: 3 }]}>TB/Đơn</Text>
                </View>

                {stats.statistics.map((stat, index) => (
                    <View key={index} style={[
                        styles.tableRow,
                        index % 2 === 0 ? styles.evenRow : styles.oddRow
                    ]}>
                        <Text style={[styles.tableCell, { flex: 2 }]}>
                            {periodType === 'month' ? `${stat.month_name} ${stat.year}` :
                             periodType === 'quarter' ? `Quý ${stat.quarter}/${stat.year}` :
                             stat.year}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 3 }]}>
                            {formatCurrency(stat.total_revenue)}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 2 }]}>
                            {stat.total_orders}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 3 }]}>
                            {formatCurrency(stat.avg_order_value)}
                        </Text>
                    </View>
                ))}

                <View style={styles.tableSummary}>
                    <Text style={[styles.summaryCell, { flex: 2 }]}>Tổng cộng</Text>
                    <Text style={[styles.summaryCell, { flex: 3 }]}>
                        {formatCurrency(stats.total_revenue_all_periods)}
                    </Text>
                    <Text style={[styles.summaryCell, { flex: 2 }]}>
                        {stats.total_orders_all_periods}
                    </Text>
                    <Text style={[styles.summaryCell, { flex: 3 }]}>
                        {formatCurrency(
                            stats.total_orders_all_periods > 0
                                ? stats.total_revenue_all_periods / stats.total_orders_all_periods
                                : 0
                        )}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Thống kê doanh thu</Text>
                <Text style={styles.shopName}>{stats?.shop_name}</Text>
            </View>

            <View style={styles.filterContainer}>
                <View style={styles.periodButtons}>
                    <TouchableOpacity 
                        style={[styles.periodButton, periodType === 'month' && styles.activePeriod]}
                        onPress={() => setPeriodType('month')}
                    >
                        <Text style={periodType === 'month' ? styles.activeText : styles.inactiveText}>
                            Tháng
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.periodButton, periodType === 'quarter' && styles.activePeriod]}
                        onPress={() => setPeriodType('quarter')}
                    >
                        <Text style={periodType === 'quarter' ? styles.activeText : styles.inactiveText}>
                            Quý
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.periodButton, periodType === 'year' && styles.activePeriod]}
                        onPress={() => setPeriodType('year')}
                    >
                        <Text style={periodType === 'year' ? styles.activeText : styles.inactiveText}>
                            Năm
                        </Text>
                    </TouchableOpacity>
                </View>
                {renderYearSelector()}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : (
                renderStatisticsTable()
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    shopName: {
        fontSize: 18,
        color: '#666',
    },
    filterContainer: {
        marginBottom: 20,
    },
    periodButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    periodButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        minWidth: 80,
        alignItems: 'center',
    },
    activePeriod: {
        backgroundColor: '#5196f4',
    },
    yearSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    yearButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 5,
        marginVertical: 5,
    },
    activeYearButton: {
        backgroundColor: '#5196f4',
    },
    yearText: {
        color: '#666',
    },
    activeYearText: {
        color: '#fff',
    },
    activeText: {
        color: '#fff',
    },
    inactiveText: {
        color: '#666',
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#5196f4',
        padding: 12,
    },
    headerCell: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'right',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    evenRow: {
        backgroundColor: '#fff',
    },
    oddRow: {
        backgroundColor: '#f9f9f9',
    },
    tableCell: {
        fontSize: 14,
        textAlign: 'right',
    },
    tableSummary: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#f0f8ff',
        borderTopWidth: 2,
        borderTopColor: '#5196f4',
    },
    summaryCell: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'right',
        color: '#5196f4',
    },
    noDataContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 16,
        color: '#666',
    },
    loader: {
        marginTop: 20,
    }
});

export default Statistics;