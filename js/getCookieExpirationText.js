
function getCookieExpirationText(frameTimestamp, expires){
  if(expires === -1){
    return 'Session';
  }
  const diff = expires - frameTimestamp;
  const days = Math.round(diff / (60 * 60 * 24));
  const hours = Math.round(diff / (60 * 60));
  const minutes = Math.round(diff / 60);
  if (days > 0) {
    if(days === 1){
      return '1 day';
    }
    return `${days} days`;
  } else if (hours > 1) {
    if(hours === 1){
      return '1 hour';
    }
    return `${hours} hours`;
  } else if (minutes > 0) {
    if(minutes === 1){
      return '1 minute';
    }
    return `${minutes} minutes`;
  } else {
    if(diff === 1){
      return '1 second';
    }
    return `${diff} seconds`;
  }
}

export default getCookieExpirationText;
