import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const CommentModal = ({ visible, onClose, onSubmit, setContent, content, isUpdate}) => {

  const handleSend = async () => {
    const success = await onSubmit(content);  // <- chờ gửi xong
    if (success) {
      setContent("");   // Reset khi gửi thành công
      onClose();        // Đóng modal
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {isUpdate ? <Text style={styles.title}>Sửa bình luận</Text> : <Text style={styles.title}>Nhập nội dung bình luận</Text>}
          <TextInput
            style={styles.input}
            value={content}
            onChangeText={content => setContent(content)}
            placeholder={isUpdate ? "Nhập nội dung bình luận mới" : "Nhập nội dung bình luận"}
            multiline
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={{ color: 'white' }}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Text style={{ color: 'white' }}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CommentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '85%',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  cancelBtn: {
    backgroundColor: 'gray',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
