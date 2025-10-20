import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <div>
        <div className="h-13 flex flex-row justify-between px-5 py-1 bg-white shadow-md">
        <div className='flex flex-row space-x-1'>
          <img src={logo} alt="" className='h-12 w-12 mb-1'/>
          <h1 className='font-semibold text-xl mt-2'>GenAI Stack</h1>
        </div>
        <h2 className='text-lg border rounded-full bg-purple-300 text-white px-4 py-2 cursor-pointer'>S</h2>
      </div>
    </div>
  )
}

export default Navbar