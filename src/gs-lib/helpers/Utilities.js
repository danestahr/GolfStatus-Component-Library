export const getInitial = (name) => {
  if (name && name.length && name.length > 0) {
    let init = name[0];
    for (let i = 0; i < name.length-1; i++) {
      if (name[i] === " ") {
        init += name[i + 1];
      }
    }
    return init;
  }
}

export const utilities = {getInitial};

export const handleEnterKey = (e, action) => {
  if (e.key === "Enter") {
    action?.(e)
  }
}