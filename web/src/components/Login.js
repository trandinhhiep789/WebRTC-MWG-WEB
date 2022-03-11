

import React from 'react'
import { useDispatch } from 'react-redux'
import { Button, Input } from 'antd';
import 'antd/dist/antd.css'
import { useNavigate } from 'react-router-dom';
import { handleUserInfor } from '../redux/action/ListOnlineUserAction'

const Login = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [yourName, setYourName] = React.useState()

    return (
        <div style={{ minHeight: "100vh", width: "50%", display: "flex", justifyContent: 'center', alignItems: 'center' }}>
            <Input
                value={yourName}
                placeholder="Nhập tên của bạn"
                onChange={(e) => {
                    setYourName(e.target.value)
                }}
                style={{ width: '100%' }}
            />

            {yourName && yourName.length > 3 ?
                <Button type="primary" onClick={() => {
                    dispatch(handleUserInfor(yourName))
                    navigate('/UserOnline')

                }}>
                    Đăng nhập
                </Button>
                : ""}

        </div>
    )
}

export default Login