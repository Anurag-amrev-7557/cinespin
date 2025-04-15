import "./Spinner.css"

const Spinner = () => {
    return (
        <div className="movie-details-loading">
            <div aria-live="assertive" role="alert" className="loader"></div>
        </div>
    );
}

export default Spinner;