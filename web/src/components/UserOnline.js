// import PropTypes from 'prop-types'
// import React, { memo } from 'react'
// import { Modal, Input } from 'antd';

// class Login extends React.Component {
//     constructor(props) {
//         super(props)

//         this.state = {
//             myName: "",
//             isLogin: false,
//         }
//     }

//     componentDidMount = () => {
//         if (!this.state.myName) {
//             this.info()
//         }
//     }

//     info = () => {
//         Modal.info({
//             title: 'Vui lòng đăng nhập',
//             content: (
//                 <div>
//                     <Input
//                         placeholder="Nhập tên của bạn"
//                         onChange={(e) => this.setState({ myName: e.target.value })}
//                         style={{ width: '100%' }}
//                     />
//                 </div>
//             ),
//             onOk: () => {
//                 if (this.state.myName.length < 4) {
//                     return this.info()
//                 }
//                 this.setState({ isLogin: true })
//             },
//         });
//     }
//     render() {
//         return (
//             <div>Login</div>
//         )
//     }
// }

// export default Login



import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import io from 'socket.io-client'
import { Modal, Typography, Avatar, Tooltip, Input, Button } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import "./styles.css"

import { handleUpdateUserOnline } from "../redux/action/ListOnlineUserAction"

import { connect } from 'react-redux';
import RoomCalling from "./RoomCalling"
class UserOnline extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            listUserOnline: [],
            myId: "",
        }

        this.serviceIP = 'http://localhost:8082/webrtcPeerOnlineUser'
        // this.serviceIP = 'https://api-webrtc-mwg.herokuapp.com/webrtcPeerOnlineUser'
        this.socket = null
    }
    componentDidMount = () => {

        const { handleUpdateUserOnline, myName } = this.props
        this.socket = io.connect(
            this.serviceIP,
            {
                path: '/io/webrtc',
                query: {
                    username: ""
                }
            }
        )
        this.socket.on("myId", myId => {
            this.setState({ myId })
        })
        this.socket.emit('addUser', myName.userInfo)
        this.socket.on("getUserOnline", userList => {
            console.log("userList before filter", userList)
            userList = userList.filter((user) => user.id !== this.state.myId)
            console.log("userList after filter", userList)
            this.setState({ listUserOnline: userList })
            if (userList && userList.length > 0) {
                handleUpdateUserOnline(userList)
            }
        })
        this.socket.on("getLinkToCall", ({ senderId, link }) => {
            console.log(senderId, link)
            this.setState({
                nguoiGoiDen: senderId,
                linkMeet: link,
            })
            this.showConfirm(senderId, link)
        })
    }

    showConfirm = (username, linkMeet) => {
        Modal.confirm({
            title: `${username} đang gọi đến cho bạn`,
            icon: <PhoneOutlined rotate={90} twoToneColor="#52c41a" />,
            content: "Cuộc gọi sẽ bắt đầu ngay khi bạn trả lời",
            okText: "Chấp nhận",
            cancelText: "Từ chối",
            onOk() {
                window.open(`http://localhost:3000/${linkMeet}`, "_blank",
                    `location=no,
              toolbar=yes,
              scrollbars=yes,
              resizable=yes,
              top=0,
              left=${(window.screen.width - document.documentElement.clientWidth * 0.96) / 2},
              width=${document.documentElement.clientWidth * 0.96},
              height=${document.documentElement.clientHeight}`);
            },
            onCancel() {
                console.log('Từ chối');
            },
        });
    }

    makeid = (length) => {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    callUser = (id) => {
        let id_room = this.makeid(7)
        id_room = "room/" + id_room
        window.open(`http://localhost:3000/${id_room}`, "_blank",
            `location=no,
       toolbar=yes,
       scrollbars=yes,
       resizable=yes,
       top=0,
       left=${(window.screen.width - document.documentElement.clientWidth * 0.96) / 2},
       width=${document.documentElement.clientWidth * 0.96},
       height=${document.documentElement.clientHeight}`
        );

        this.socket.emit('sendLinkToCall', {
            senderId: '123123',
            receiverId: id,
            link: id_room
        })
    }


    render() {
        return (
            <div>
                {this.props.myName.userInfo ?
                    <div>
                        <div className="listUserOnline">

                            <div>
                                Mã ID của bạn (sau khi đã đăng nhập)<br />
                                <div className="bgGlass">
                                    <div>
                                        <Tooltip placement="leftTop" title={this.state.myId}>
                                            <div style={{ position: 'relative' }}>
                                                <Avatar style={{
                                                    color: '#fff',
                                                    backgroundColor: '#42b5a6',
                                                }}>
                                                    {this.props.myName.userInfo[0]}
                                                </Avatar>
                                                <div style={{ position: "absolute", bottom: "0px", right: "-6px", width: '15px', height: '15px', backgroundColor: '#fff', borderRadius: "50%", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <div style={{ width: '10px', height: '10px', backgroundColor: 'green', borderRadius: "50%" }}></div>
                                                </div>
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {/* <div>{this.state.myId.substring(this.state.myId.indexOf("#"), this.state.myId.length)}</div> */}
                                        <div>{this.props.myName.userInfo}</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                Danh sách người dùng đang online<br />
                                {this.state.listUserOnline && this.state.listUserOnline.map((item, i) =>
                                    <div key={i} style={{ cursor: 'pointer' }} className="bgGlass">
                                        <div>
                                            <Typography.Text type="success" onClick={() => this.callUser(item.id)} style={{ color: '=' }} key={i}>
                                                <Tooltip placement="rightTop" title={item.id}>
                                                    <div style={{ position: 'relative' }}>
                                                        <Avatar style={{
                                                            color: '#ffce54',
                                                            backgroundColor: '#1d6f5a',
                                                        }}>
                                                            {/* {item.id[item.id.length - 1]} */}
                                                            {item.name[0]}
                                                        </Avatar>
                                                        <div style={{ position: "absolute", bottom: "0px", right: "-6px", width: '15px', height: '15px', backgroundColor: '#fff', borderRadius: "50%", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                            <div style={{ width: '10px', height: '10px', backgroundColor: 'green', borderRadius: "50%" }}></div>
                                                        </div>
                                                    </div>
                                                </Tooltip>
                                            </Typography.Text>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            {/* <div>{item.id.substring(item.id.indexOf("#"), item.id.length)}</div> */}
                                            <div>{item.name}</div>
                                        </div>
                                    </div>
                                )
                                }
                            </div>
                        </div>
                        <Routes>
                            <Route path="/room/:id" element={<RoomCalling />}></Route>
                        </Routes>
                    </div> : "Chu dang nhap"}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        myName: state.stateListUserOnline,
    }
}

function mapDispatchToProps(dispatch) {
    // when arguments match, you can pass configuration object, which will 
    // wrap your actions creators with dispatch automatically.
    return {
        handleUpdateUserOnline: (listUserOnline) => dispatch(handleUpdateUserOnline(listUserOnline))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserOnline);