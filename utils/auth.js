import jwt from 'jsonwebtoken'

const signToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

const isAuth = async (req, res, next) => {
  const { authorization } = req.headers
  if (authorization) {
    // Bearer xxx => xxxに変換
    const token = authorization.slice(7, authorization.length)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).send({ message: 'Token is not valid' })
      } else {
        req.user = decoded
        next()
      }
    })
  } else {
    res.status(401).send({ message: 'Token is not supplied' })
  }
}

const isAdmin = async (req, res, next) => {
  if (req.user.isAdmin) {
    next()
  } else {
    res.status(401).send({ message: 'User is not admin' })
  }
}

export { signToken, isAuth, isAdmin }
