import { useContext, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { authAPI, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/Context";
import CommentModal from "./CommentModal";
import { useNavigation } from "@react-navigation/native";

const CreateComment = ({productId, reloadComment, content, setContent, showModal, setShowModal, comment, setComment, parentId, reply, setReply}) => {
    const user = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const nav = useNavigation();
    

    const validate = () => {
        if(content.trim() === ""){
            setError("Vui lòng nhập nội dụng bình luận!");
            Alert.alert(error);
            return false;
        }
        return true;
    }
    

    const handleSubmit = async (content) => {
    
        if (!user?.token) {
            // Alert.alert("Bạn cần đăng nhập để bình luận!");
            // return;
            Alert.alert(
                "Cảnh báo",
                "Bạn phải đăng nhập để bình luận!",[
                    {
                        text: "Hủy",
                        style: "cancel",
                    },
                    {
                        text: "Đăng nhập",
                        onPress: () => {
                            nav.navigate("Chính", {screen: "Đăng nhập"});
                        }
                    }
                ]
            );
            return;
        }
        if(!validate()){
            return;
        }   
        try {
            setLoading(true);
            const url = endpoints["comment"](productId);
            const form = new FormData();
            form.append("content", content);
            if(reply===true){
                form.append("parent", parentId);
             }
            const res = await authAPI(user.token).post(url, form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const newComment = res?.data;

            setComment([
                newComment,
                ...comment
            ]);
    
            if (res.status === 201) {
                setContent("");
                reloadComment?.(); // Gọi reload nếu có
                return true; 
            } else {
                Alert.alert("Gửi bình luận thất bại!");
            }
        } catch (error) {
            // console.error("Lỗi khi gửi bình luận:", error);
            // console.error(error.response.data);
            Alert.alert("Lỗi khi gửi bình luận!");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <View style={{flexDirection: "row", flex: 1}}>
            {/* <TextInput style={{borderWidth: 1, borderColor: "gray", padding: 10, borderRadius: 10, flex: 8, margin: 5}}
                placeholder="Nhập nội dụng bình luận của bạn..."
                value={content}
                onChangeText={t => setContent(t)}
            />
            <TouchableOpacity  onPress={handleSubmit} style={{backgroundColor: "blue", padding: 10, borderRadius: 10, flex: 2, margin: 5}}>
                {loading ? <ActivityIndicator size="small" color="white" /> : <Text style={{color: "white"}}>Gửi</Text>}

            </TouchableOpacity> */}
            <TouchableOpacity onPress={() => setShowModal(true)} style={{backgroundColor: "blue", padding: 10, borderRadius: 10, flex: 2, margin: 5}}>
                <Text style={{color: "white", textAlign: "center"}}>Thêm bình luận</Text>

            </TouchableOpacity>
            <CommentModal visible={showModal} onClose={() => setShowModal(false)} onSubmit={(handleSubmit)} 
            setContent={setContent} content={content} isUpdate={false} />
            <CommentModal visible={reply} onClose={() => setReply(false)} onSubmit={(handleSubmit)} 
            setContent={setContent} content={content} isUpdate={false} />
        </View>
    )
}

export default CreateComment;
