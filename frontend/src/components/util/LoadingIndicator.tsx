import Spinner from 'react-bootstrap/Spinner';

export default function LoadingIndicator() {
    return (
        <Spinner id="loadingindicator-spinner" animation="border" role="status">
            <span id="loadingindicator-spinner-span" className="visually-hidden">Loading...</span>
        </Spinner>
    );
}