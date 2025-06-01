import { useContext, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { authAPI, endpoints } from "../../configs/Apis";
import { MyCartContext, MyUserContext } from "../../configs/Context";
import CommentModal from "./CommentModal";

const CreateComment = ({productId, reloadComment, content, setContent, showModal, setShowModal, comment, setComment}) => {
    const user = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const validate = () => {
        if(content.trim() === ""){
            setError("Vui lòng nhập nội dụng bình luận!");
            Alert.alert(error);
            return false;
        }
        return true;
    }
    

    const handleSubmit = async (content) => {
        console.log("Press");
        console.log("user: ", user);
    
        if (!user?.token) {
            Alert.alert("Bạn cần đăng nhập để bình luận!");
            return;
        }
        if(!validate()){
            return;
        }   
        try {
            setLoading(true);
            const url = endpoints["comment"](productId);
            console.log("url: ", url);
            const form = new FormData();
            form.append("content", content);
            // Nếu backend không cần parent thì bạn có thể bỏ dòng sau:
            // if(){
            //     form.append("parent", "");
            //  }
            console.log("form: ", form);
            const res = await authAPI(user.token).post(url, form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("res.status:", res.status);
            const newComment = res?.data;
            console.log("newComment: ", newComment);

            setComment([
                newComment,
                ...comment
            ]);
    
            if (res.status === 201) {
                setContent("");
                console.log("Bình luận đã được gửi thành công");
                reloadComment?.(); // Gọi reload nếu có
                return true; 
            } else {
                console.log("Gửi bình luận thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi gửi bình luận:", error);
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
                <Text style={{color: "white"}}>Thêm comment</Text>

            </TouchableOpacity>
            <CommentModal visible={showModal} onClose={() => setShowModal(false)} onSubmit={(handleSubmit)} 
            setContent={setContent} content={content} isUpdate={false} />
        </View>
    )
}

export default CreateComment;
