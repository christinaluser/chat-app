import React from "react";
import "../App.css"

class SidePanel extends React.Component {
  render = () => (
    <div className="user-panel">
      <div className="users-wrapper">
        <h1>online</h1>
        <div className="user">{this.props.currentUser} (you)</div>
        {
          this.props.users.map((user, index) => {
            return this.props.currentUser === user.username ? 
              <div className="empty-user" key={index}/> :
              <div className="user" key={index}>{user.username}</div>
          }) 
        }
      </div>
      <div className="info-wrapper">
        <h2>commands</h2>
        <li>/name username</li>
        <li>/color RRGGBB</li>
        <h2>emojis</h2>
      </div>
    </div> 
  );
}

export default SidePanel;