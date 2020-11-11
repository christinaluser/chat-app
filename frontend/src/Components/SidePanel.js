import React from "react";
import "../App.css"

class SidePanel extends React.Component {
  render = () => (
    <div className="side-panel">
      <div className="users-wrapper side-panel-container">
        <h2>online</h2>
        <div className="user">{sessionStorage.getItem("username")} (you)</div>
        {
          this.props.users.map((user, index) => {
            return sessionStorage.getItem("username") === user.username ? 
              <div className="empty-user" key={index}/> :
              <div className="user" key={index}>{user.username}</div>
          }) 
        }
      </div>
      {/* <div className="info-wrapper"> */}
        <div className="commands-wrapper side-panel-container">
          <h2>commands</h2>
          <li>/name username</li>
          <li>/color RRGGBB</li>
        </div>
        <div className="markdown-wrapper side-panel-container">
          <h2>markdown</h2>
          <li>**bold**</li>
          <li>//italics//</li>
          <li>__underline__</li>
        </div>
        <div className="emojis-wrapper side-panel-container">
          <h2>emojis</h2>
          <li>:) <img className="emoji" src="https://www.flaticon.com/svg/static/icons/svg/1933/1933663.svg" alt="smile-emoji"/></li>
          <li>:( <img className="emoji" src="https://www.flaticon.com/svg/static/icons/svg/1933/1933260.svg" alt="surprised-emoji"/></li>
          <li>:o <img className="emoji" src="https://www.flaticon.com/svg/static/icons/svg/1933/1933111.svg" alt="frown-emoji"/></li>
        </div>
      </div>
    // </div> 
  );
}

export default SidePanel;