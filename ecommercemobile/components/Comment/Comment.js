import { Image, Modal, Text, TouchableOpacity, View, Alert } from "react-native";
import Apis, { endpoints, authAPI } from "../../configs/Apis";
import { useContext, useEffect, useState } from "react";
import Styles from "./Styles";
import { MyUserContext } from "../../configs/Context";
import CommentModal from "./CommentModal";

const Comment = ({ productId, reload, loadMore, setLoadMore , setStop, comment, setComment, ownerCmt, setOwnerCmt, setReply, content, setContent, setParentId}) => {
    const user = useContext(MyUserContext);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [show, setShow] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const [isUpdate, setIsUpdate] = useState(false);

    const loadComment = async () => {
        if (page === 0) return;

        try {
            setLoading(true);
            let url = `${endpoints["comment"](productId)}?page=${page}`;
            const res = await Apis.get(url);
            const newComment = res?.data?.results;

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

    const deleteComment = async (commentId) => {
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc muốn xóa bình luận này?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    onPress: async () => {
                        try {
                            const url = `${endpoints["deleteComment"](commentId)}`;
                            console.log("urlc xóa: ", url);
                            const res = await authAPI(user.token).delete(url);
                            console.log("res: ", res.data);
                            setComment(prevComment => prevComment.filter(c => c.id !== commentId));
                        } catch (error) {
                            console.log("Lỗi xóa comment:", error);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const updateComment = async (newContent) => {
        if (!selectedCommentId) return false;
      
        try {
          const url = `${endpoints["deleteComment"](selectedCommentId)}`;
          console.log("url sửa: ", url);
          const res = await authAPI(user.token).patch(url, { content: newContent });
        //   console.log("res newContent: ", res.data);
          setComment(prevComment =>
            prevComment.map(c => c.id === selectedCommentId ? res.data : c)
          );
          return true;  // Thành công
        } catch (error) {
          console.log("Lỗi sửa comment:", error);
          return false;  // Lỗi
        }
      };

    const renderCommentActions = (item) => {
        if (user?.username !== item.user?.username) return null;

        return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                    style={{ backgroundColor: "lightgray", padding: 3, borderRadius: 5, margin: 3 }}
                    onPress={() => {
                        setContent(item.content);        // Gán nội dung vào TextInput
                        setSelectedCommentId(item.id);   // Lưu ID comment đang sửa
                        setIsUpdate(true);
                        setShow(true);
                        console.log("Sửa comment:", item.id);
                        
                    }}
                >
                    <Text style={{ color: "green", fontSize: 12 }}>Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {deleteComment(item.id);}}
                    style={{ backgroundColor: "lightgray", padding: 3, borderRadius: 5, margin: 3 }}
                >
                    <Text style={{ color: "red", fontSize: 12 }}>Xóa</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Hiển thị comment con
    const renderChildComments = (parentId) => {
        return comment.filter(child => child.parent === parentId).map(child => (
            <View key={child.id} style={[Styles.comment, { marginLeft: 20 }]}>
                <View style={Styles.row}>
                    <Image source={{ uri: child.user?.avatar }} style={Styles.avatar} />
                    <Text style={Styles.username}>{child.user?.username}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ marginRight: 10 }}>{child.content}</Text>
                    <TouchableOpacity onPress={() => {
                        setReply(true);
                        setOwnerCmt(child.user?.id);
                        setParentId(child.id);
                    }} style={{ backgroundColor: "lightgray", padding: 3, borderRadius: 5, margin: 3 }}>
                        <Text style={{ color: "blue", fontSize: 12 }}>Phản hồi {child?.user?.username}</Text>
                    </TouchableOpacity>

                    {/* Action cho comment con */}
                    {renderCommentActions(child)}
                </View>
            </View>
        ));
    };

    const loadMoreComment = () => {
        if (!loading && page > 0)
            setPage(page + 1);
    };

    useEffect(() => {
        if (loadMore) {
            loadMoreComment();
            setLoadMore(false);
        }
    }, [loadMore]);

    // useEffect(() => {
    //     setComment([]);
    //     setPage(1);
    //     setStop(false);
    // }, [reload]);

    useEffect(() => {
        loadComment();
    }, [productId, reload, page]);

    return (
        <View>
            <CommentModal visible={show} onClose={() => setShow(false)} onSubmit={updateComment} 
            setContent={setContent} content={content} isUpdate={isUpdate} />
            {/* Hiển thị comment cha */}
            {comment
                .filter(item => item.parent === null)
                .map(item => (
                    <View style={Styles.comment} key={item.id}>
                        <View style={Styles.row}>
                            <Image source={{ uri: item.user?.avatar }} style={Styles.avatar} />
                            <Text style={Styles.username}>{item.user?.username}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ marginRight: 10 }}>{item.content}</Text>
                            <TouchableOpacity onPress={() => {
                                setReply(true);
                                setOwnerCmt(item.user?.id);
                                setParentId(item.id);
                            }} style={{ backgroundColor: "lightgray", padding: 3, borderRadius: 5, margin: 3 }}>
                                <Text style={{ color: "blue", fontSize: 12 }}>Phản hồi {item.user?.username}</Text>
                            </TouchableOpacity>

                            {/* Action cho comment cha */}
                            {renderCommentActions(item)}
                        </View>

                        {/* Hiển thị comment con */}
                        {renderChildComments(item.id)}
                    </View>
                ))}
        </View>
    );
};

export default Comment;
