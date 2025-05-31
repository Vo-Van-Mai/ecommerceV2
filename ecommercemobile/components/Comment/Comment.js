import { Image, Text, View } from "react-native";
import Apis, { endpoints } from "../../configs/Apis";
import { useEffect, useState } from "react";
import Styles from "./Styles";

const Comment = ({ productId, reload, loadMore, setLoadMore , setStop}) => {
    const [comment, setComment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const loadComment = async () => {
        if (page === 0) return; // nếu hết trang thì dừng
    
        try {
            setLoading(true);
            let url = `${endpoints["comment"](productId)}?page=${page}`;
            const res = await Apis.get(url);
            console.log("res.data: ", res?.data?.results);
    
            const newComment = res?.data?.results ?? [];
    
            setComment(prevComment => [
                ...prevComment,
                ...newComment.filter(c => !prevComment.some(prev => prev.id === c.id))
            ]);
    
            if (res.data.next === null) {
                setPage(0);
                setStop(true);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComment();
    }, [productId, reload, page]);

    // Hiển thị comment con
    const renderChildComments = (parentId) => {
        return comment.filter(child => child.parent === parentId).map(child => (
                <View key={child.id} style={[Styles.comment, { marginLeft: 20 }]}>
                    <View style={Styles.row}>
                        <Image source={{ uri: child.user?.avatar }} style={Styles.avatar} />
                        <Text style={Styles.username}>{child.user?.username}</Text>
                    </View>
                    <Text>{child.content}</Text>
                </View>
            ));
    };

    const loadMoreComment = () => {
        if(!loading && page > 0)
            setPage(page + 1);
    }

    useEffect(() => {
        if(loadMore) {
            loadMoreComment();
            setLoadMore(false);
        }
        }, [loadMore]);

    return (
        <View>
            {/* Hiển thị comment cha */}
            {comment
                .filter(item => item.parent === null)
                .map(item => (
                    <View style={Styles.comment} key={item.id}>
                        <View style={Styles.row}>
                            <Image source={{ uri: item.user?.avatar }} style={Styles.avatar} />
                            <Text style={Styles.username}>{item.user?.username}</Text>
                        </View>
                        <Text>{item.content}</Text>

                        {/* Hiển thị comment con */}
                        {renderChildComments(item.id)}
                    </View>
                ))}
        </View>
    );
};

export default Comment;
