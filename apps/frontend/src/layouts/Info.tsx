
interface ConatinerProps{
  children: React.ReactNode
}
const Info: React.FC<ConatinerProps> = ({children}) => {
  return (
    <div className="w-full h-screen flex justify-center bg-primary-6 dark:bg-dark-1">
      {children}
    </div>
  )
}

export default Info