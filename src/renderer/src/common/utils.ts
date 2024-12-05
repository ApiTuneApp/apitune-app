export const getAvatarUrl = (user: any) => {
  if (user?.avatar) {
    return user.avatar
  }
  // Option 1: DiceBear (many different styles available)
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${
    user?.email || user?.id
  }&radius=50&backgroundColor=b6e3f4`

  // Option 2: UI Avatars (text-based)
  // return `https://ui-avatars.com/api/?name=${
  //   user?.email?.charAt(0) || "U"
  // }&background=random`;
}
