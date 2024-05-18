import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Avatar,
  Tooltip,
  IconButton,
} from '@material-tailwind/react';

export function Profile() {
  const [profile, setProfile] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    username: '',
    profile_img: '',
    contact_no: '',
  });

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3001/users/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update user profile details
      await axios.put(
        'http://localhost:3001/users/me',
        profile,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (selectedImage) {
        const formData = new FormData();
        formData.append('profile_img', selectedImage);

        await axios.put(
          'http://localhost:3001/users/me/profile_img',
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="mt-12 mb-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Edit Profile
          </Typography>
        </CardHeader>
        <CardBody className="px-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Input
                type="text"
                label="First Name"
                name="firstname"
                value={profile.firstname}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Input
                type="text"
                label="Last Name"
                name="lastname"
                value={profile.lastname}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Input
                type="email"
                label="Email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Input
                type="password"
                label="Password"
                name="password"
                value={profile.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Input
                type="text"
                label="Username"
                name="username"
                value={profile.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Input
                type="text"
                label="Contact Number"
                name="contact_no"
                value={profile.contact_no}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Typography variant="small" className="block mb-2">
                Profile Image
              </Typography>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {profile.profile_img && (
                <div className="mt-4">
                  <Avatar
                    src={profile.profile_img}
                    alt="Profile Image"
                    size="xl"
                    variant="rounded"
                  />
                </div>
              )}
            </div>
            <Button type="submit" color="blue" variant="gradient">
              Update Profile
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default Profile;
