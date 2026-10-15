const Notification = ({ message, err }) => {
  if (message === null) {
    return null
  }

  const color = err === true ? "error" : "success";

  return (
    <div className={color}>
      {message}
    </div>
  )
}

export default Notification