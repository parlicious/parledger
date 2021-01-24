import Avatar from "react-avatar";

export const UserAvatar = (props) => {
    const {user} = props;
    if (user.avatarUrl) {
        return <Avatar size={40} round={true} src={user.avatarUrl}/>
    } else {
        return <Avatar size={40} round={true} name={user.displayName}/>
    }
}
