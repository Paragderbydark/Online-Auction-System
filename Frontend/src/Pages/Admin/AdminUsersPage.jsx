import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../Components/AdminNavbar';
import { getUserData } from '../../Utils/auth';
import { SERVER_URL, USER_SERVICE_URL } from '../../Utils/config';
import axios from 'axios';

const AdminUsersPage = () => {
  const [userType, setUserType] = useState('all');
  const [users, setUsers] = useState([]);

  const filteredUsers = users.filter(user => {
    if (userType === 'all') return true;
    if (userType === 'buyers') return user.role.includes('BUYER');
    if (userType === 'sellers') return user.role.includes('SELLER');
    return true;
  });

  const buyerAvatars = [
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerOne&topType=ShortHairTheCaesar&clotheType=TShirt&eyeType=Default&mouthType=Smile&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerTwo&topType=LongHairMiaWallace&clotheType=CollarSweater&eyeType=Happy&mouthType=Default&skinColor=Tanned',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerThree&topType=ShortHairShortWaved&clotheType=ShirtCrewNeck&eyeType=Wink&mouthType=Smile&skinColor=Pale',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerFour&topType=Hat&clotheType=Overall&eyeType=Side&mouthType=Contempt&skinColor=Yellow',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerFive&topType=ShortHairFrizzle&clotheType=ShirtVNeck&eyeType=Squint&mouthType=Twinkle&skinColor=Brown',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerSix&topType=WinterHat2&clotheType=Hoodie&eyeType=Close&mouthType=Serious&skinColor=DarkBrown',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerSeven&topType=ShortHairShortFlat&clotheType=GraphicShirt&eyeType=EyeRoll&mouthType=Eating&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerEight&topType=LongHairCurly&clotheType=ShirtCrewNeck&eyeType=Hearts&mouthType=Disbelief&skinColor=Tanned',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerNine&topType=Hijab&clotheType=CollarSweater&eyeType=Happy&mouthType=Smile&skinColor=Yellow',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerTen&topType=ShortHairShortCurly&clotheType=TShirt&eyeType=Default&mouthType=Tongue&skinColor=Pale',
  ];

  const sellerAvatars = [
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerA&topType=ShortHairShortFlat&clotheType=BlazerShirt&accessoriesType=Prescription02&eyeType=Default&mouthType=Serious&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerB&topType=ShortHairShortRound&clotheType=BlazerSweater&accessoriesType=Wayfarers&eyeType=Squint&mouthType=Default&skinColor=Tanned',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerC&topType=LongHairStraight2&clotheType=CollarSweater&accessoriesType=Blank&eyeType=Happy&mouthType=Smile&skinColor=Yellow',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerD&topType=Eyepatch&clotheType=ShirtCrewNeck&accessoriesType=Kurt&eyeType=Default&mouthType=Serious&skinColor=Pale',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerE&topType=ShortHairShortCurly&clotheType=BlazerShirt&accessoriesType=Prescription01&eyeType=Wink&mouthType=Twinkle&skinColor=Brown',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerF&topType=LongHairBigHair&clotheType=CollarSweater&accessoriesType=Blank&eyeType=Default&mouthType=Concerned&skinColor=DarkBrown',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerG&topType=Turban&clotheType=BlazerSweater&accessoriesType=Prescription02&eyeType=Side&mouthType=Contempt&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerH&topType=ShortHairDreads01&clotheType=Overall&accessoriesType=Blank&eyeType=Happy&mouthType=Smile&skinColor=Tanned',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerI&topType=ShortHairShortRound&clotheType=BlazerShirt&accessoriesType=Round&eyeType=Default&mouthType=Default&skinColor=Yellow',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerJ&topType=ShortHairShortFlat&clotheType=CollarSweater&accessoriesType=Blank&eyeType=Squint&mouthType=Serious&skinColor=Pale',
  ];

  const adminAvatars = [
    'https://avataaars.io/?avatarStyle=Circle&seed=AdminOne&topType=ShortHairShortFlat&clotheType=BlazerShirt&accessoriesType=Blank&eyeType=Default&mouthType=Serious&skinColor=Tanned',
    'https://avataaars.io/?avatarStyle=Circle&seed=AdminTwo&topType=ShortHairTheCaesarSidePart&clotheType=BlazerSweater&accessoriesType=Sunglasses&eyeType=Squint&mouthType=Default&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&seed=AdminThree&topType=Hat&clotheType=CollarSweater&accessoriesType=Prescription02&eyeType=Wink&mouthType=Smile&skinColor=Brown',
    'https://avataaars.io/?avatarStyle=Circle&seed=AdminFour&topType=LongHairBun&clotheType=BlazerShirt&accessoriesType=Blank&eyeType=Happy&mouthType=Twinkle&skinColor=DarkBrown',
    'https://avataaars.io/?avatarStyle=Circle&seed=AdminFive&topType=ShortHairFrizzle&clotheType=CollarSweater&accessoriesType=Round&eyeType=Side&mouthType=Concerned&skinColor=Yellow',
  ];

  const roleColors = {
    BUYER: 'bg-blue-900 text-blue-400',
    SELLER: 'bg-purple-900 text-purple-400',
    ADMIN: 'bg-red-900 text-red-400',
    DEFAULT: 'bg-gray-700 text-gray-300'
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');


      // const response = await axios.get(`${SERVER_URL}/users/admin/all`, {
      const response = await axios.get(`${USER_SERVICE_URL}/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetched Users:', response.data);
      const fetchedUsers = response.data;

      const normalizedUsers = fetchedUsers.map(user => ({
        ...user,
        role: user.role ? user.role.split(',').map(r => r.trim()) : []
      }));

      setUsers(normalizedUsers);

    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      // await axios.delete(`${SERVER_URL}/users/admin/delete/${userId}`, {
      await axios.delete(`${USER_SERVICE_URL}/admin/delete/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(users.filter(user => user.id !== userId));
      console.log('User deleted successfully');
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  return (
    <div>
      <AdminNavbar />
      <div className="min-h-screen" style={{backgroundColor: '#1d1e22'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{fontFamily: 'PT Serif'}}>User Management</h1>
            </div>

            <div className="flex items-center bg-black rounded-lg p-1 border border-white">
              <button
                onClick={() => setUserType('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${userType === 'all' ? 'bg-yellow-300 text-black shadow-sm' : 'text-white hover:text-white'
                  }`}
              >
                All Users
              </button>
              <button
                onClick={() => setUserType('buyers')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${userType === 'buyers' ? 'bg-yellow-300 text-black shadow-sm' : 'text-white hover:text-white'
                  }`}
              >
                Buyers
              </button>
              <button
                onClick={() => setUserType('sellers')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${userType === 'sellers' ? 'bg-yellow-300 text-black shadow-sm' : 'text-white hover:text-white'
                  }`}
              >
                Sellers
              </button>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
              <div className="text-3xl font-bold mb-2" style={{ color: '#FED6AA' }}>{users.length}</div>
              <div className="text-sm text-white">Total Users</div>
            </div>
            <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
              <div className="text-3xl font-bold mb-2" style={{ color: '#FED6AA' }}>
                {users.filter(user => user.role.includes('BUYER')).length}
              </div>
              <div className="text-sm text-white">Active Buyers</div>
            </div>
            <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
              <div className="text-3xl font-bold mb-2" style={{ color: '#FED6AA' }}>
                {users.filter(user => user.role.includes('SELLER')).length}
              </div>
              <div className="text-sm text-white">Active Sellers</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6" style={{backgroundColor: '#393f4d'}}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <img
                      src={
                        user.role.includes('BUYER')
                          ? buyerAvatars[Math.floor(Math.random() * 10)]
                          : user.role.includes('SELLER')
                            ? sellerAvatars[Math.floor(Math.random() * 10)]
                            : adminAvatars[Math.floor(Math.random() * 5)]
                      }
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-white">{user.email}</p>
                    <div className="flex items-center mt-1">
                      {user.role.map((role) => {
                        let roleClass = roleColors.DEFAULT;

                        switch (role) {
                          case 'BUYER' :
                            roleClass = roleColors.BUYER;
                            break;
                          case 'SELLER' :
                            roleClass = roleColors.SELLER;
                            break;
                          case 'ADMIN' :
                            roleClass = roleColors.ADMIN;
                            break;
                          default :
                            roleClass = roleColors.DEFAULT;
                        }
                        return (
                          <span
                            key={role}
                            className={`text-xs px-2 py-1 rounded-full font-medium mr-2 ${roleClass}`}
                          >
                            {role}
                          </span>
                        );
                      })}
                    </div>
                    <p className='text-sm text-white mt-4'>Contact: {user.contact}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 border border-white text-white hover:bg-white hover:text-black text-xs font-semibold py-2 px-3 rounded-lg transition-colors">
                    View Profile
                  </button>
                  <button onClick={() => deleteUser(user.userId)} className="flex-1 border border-white text-white hover:bg-red-900 hover:text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors">
                    Delete User
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;