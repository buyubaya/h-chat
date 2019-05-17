import React, { Component } from 'react';
import { Button, Input, Modal, Badge, Icon, Card, Divider  } from 'antd';


export default class MessageOptionsArea extends Component {
    render() {
        return (
            <div>
                <Card className='msg-options-area'>
                    <table>
                        <thead>
                            <tr>
                                <th colSpan={2}>User INFO</th>
                            </tr>
                        </thead>
                        <tr>
                            <th>User ID</th>
                            <th>{userId}</th>
                        </tr>
                        <tr>
                            <th>User Name</th>
                            <td>
                                <Input 
                                    placeholder='User Name' 
                                    onChange={e => this.setState({ userName: e.target.value })}
                                />
                            </td>
                        </tr>

                        <thead>
                            <tr>
                                <th colSpan={2}>Receiver Message From</th>
                            </tr>
                            <tr>
                                <th>Room Id</th>
                                <td>
                                    <Input 
                                        value={userName} 
                                        placeholder='Receiver ID' 
                                        onChange={e => this.setState(state => {
                                            return({
                                                listenTo: {
                                                    
                                                }
                                            });
                                        })}
                                    />
                                </td>
                            </tr>
                            
                        </thead>
                    </table>
                </Card>
            </div>
        );
    }
}
