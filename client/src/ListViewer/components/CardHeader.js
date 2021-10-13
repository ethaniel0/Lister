const CardHeader = ({ title, color }) => {
    return (
        <span className="flex justify-between items-center w-full text-2xl font-normal text-left mb-2">
            <span type='text' className={'outline-none text-'+color+'-500'}>{title}</span>   
        </span>
    )
}

export default CardHeader
