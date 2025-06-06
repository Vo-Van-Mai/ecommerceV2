import React, { useContext, useState } from 'react';
import {View,Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image,} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { authAPI, endpoints } from '../../configs/Apis';
import { MyUserContext } from '../../configs/Context';
import { useNavigation } from '@react-navigation/native';

const CreateStaffForm = () => {
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useContext(MyUserContext);
  const nav = useNavigation();


  const validateForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.username || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return false;
    };
    if (formData.password !== formData.confirmPassword) {
        Alert.alert('Thông báo', 'Mật khẩu không khớp');
        return false;
      };
    return true;
  }


  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
        setLoading(true);
        const form = new FormData();
        form.append('username', formData.username);
        form.append('email', formData.email);
        form.append('password', formData.password);
        form.append('confirm_password', formData.confirmPassword);
        form.append('phone', formData.phone);
        form.append('first_name', formData.first_name);
        form.append('last_name', formData.last_name);
        form.append('role', 'staff');
        form.append('avatar', {
            uri: Image.resolveAssetSource(require('../../assets/StaffAvatar.jpg')).uri,
            name: 'avatar.jpg',
            type: 'image/jpeg'
          });

        const res = await authAPI(user.token).post(endpoints['createStaff'], form,{
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if(res.status === 201){
            Alert.alert('Thông báo', 'Tạo tài khoản nhân viên thành công');
            nav.goBack();
        }else{
            Alert.alert('Thông báo', 'Tạo tài khoản nhân viên thất bại');
        }
    } catch (error) {
        // console.error('Error:', error);
        console.log('Error:', error.response.data);
        const status = error.response.status;
        const errors = error.response.data;
        let messages = [];

        for (const field in errors) {
        if (Array.isArray(errors[field])) {
            messages.push(...errors[field]);
        } else {
            messages.push(errors[field]);
        }
        }
        if(status === 400){
            Alert.alert('Thông báo', messages.join('\n'));
        }else if(status === 401){
            Alert.alert('Thông báo', messages.join('\n'));
        }else if(status === 403){
            Alert.alert('Thông báo', messages.join('\n'));
        }else if(status === 404){
            Alert.alert('Thông báo', messages.join('\n'));
        }else if(status === 500){
            Alert.alert('Thông báo', messages.join('\n'));
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Tạo tài khoản nhân viên</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên đệm:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ và tên đệm"
              value={formData.last_name}
              onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên nhân viên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên nhân viên"
              value={formData.first_name}
              onChangeText={(text) => setFormData({ ...formData, first_name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên đăng nhập</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập mật khẩu"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <AntDesign
                  name={showPassword ? 'eye' : 'eyeo'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <AntDesign
                  name={showConfirmPassword ? 'eye' : 'eyeo'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Đang tạo...' : 'Tạo tài khoản'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateStaffForm; 