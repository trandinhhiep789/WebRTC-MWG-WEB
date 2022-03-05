

import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import io from 'socket.io-client'
import { Modal, Typography, Avatar, Tooltip } from 'antd';
import 'antd/dist/antd.css'
import { PhoneOutlined } from '@ant-design/icons';
import "../src/components/styles.css"

import RoomCalling from "./components/RoomCalling"
class App extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      listUserOnline: [],
      myId: ""
    }

    this.serviceIP = 'http://localhost:8082/webrtcPeerOnlineUser'
    this.socket = null
  }

  componentDidMount = () => {
    this.socket = io.connect(
      this.serviceIP,
      {
        path: '/io/webrtc',
        query: {
          room: window.location.pathname,
          username: ""
        }
      }
    )
    this.socket.on("myId", myId => {
      this.setState({ myId })
    })
    this.socket.emit('addUser', "hiep")
    this.socket.on("getUserOnline", userList => {
      console.log(userList)
      userList = userList.filter((user) => user.id !== this.state.myId)
      this.setState({ listUserOnline: userList })
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
       height=${document.documentElement.clientHeight}`);

    this.socket.emit('sendLinkToCall', {
      senderId: '123123',
      receiverId: id,
      link: id_room
    })
  }

  render() {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div>
            Danh sách người dùng đang online<br />
            {console.log("this.state.listUserOnline", this.state.listUserOnline)}
            {this.state.listUserOnline.map((item, i) =>
              <div style={{ cursor: 'pointer' }} className="bgGlass">
                <div>
                  <Typography.Text type="success" onClick={() => this.callUser(item.id)} style={{ color: '=' }} key={i}>
                    <Tooltip placement="rightTop" title={item.id}>
                      <div style={{ position: 'relative' }}>
                        <Avatar style={{
                          color: '#ffce54',
                          backgroundColor: '#1d6f5a',
                        }}>
                          {item.id[item.id.length - 1]}
                        </Avatar>
                        <div style={{ position: "absolute", bottom: "0px", right: "-6px", width: '15px', height: '15px', backgroundColor: '#fff', borderRadius: "50%", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ width: '10px', height: '10px', backgroundColor: 'green', borderRadius: "50%" }}></div>
                        </div>
                      </div>
                    </Tooltip>
                  </Typography.Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div>{item.id.substring(item.id.indexOf("#"), item.id.length)}</div>
                </div>
              </div>)
            }
          </div>
          <div>
            Mã ID của bạn (sau khi đã đăng nhập)<br />
            <div className="bgGlass">
              <div>
                <Tooltip placement="rightTop" title={this.state.myId}>
                  <div style={{ position: 'relative' }}>
                    <Avatar style={{
                      color: '#fff',
                      backgroundColor: '#42b5a6',
                    }}>
                      {this.state.myId[this.state.myId.length - 1]}
                    </Avatar>
                    <div style={{ position: "absolute", bottom: "0px", right: "-6px", width: '15px', height: '15px', backgroundColor: '#fff', borderRadius: "50%", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ width: '10px', height: '10px', backgroundColor: 'green', borderRadius: "50%" }}></div>
                    </div>
                  </div>
                </Tooltip>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div>{this.state.myId.substring(this.state.myId.indexOf("#"), this.state.myId.length)}</div>
              </div>
            </div>
          </div>
        </div>

        <Routes>
          <Route path="/room/:id" element={<RoomCalling />}></Route>
        </Routes>
      </div>
    );
  }
}
export default App;