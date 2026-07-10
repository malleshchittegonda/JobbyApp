import {Component} from 'react'
import Cookies from 'js-cookie'
import {Redirect} from 'react-router-dom'
import Loader from 'react-loader-spinner'
import Header from '../Header'

const apiStatusConstants = {
  initial: 'INITIAL',
  loading: 'LOADING',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class JobItemDetails extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    jobDetails: {},
    similarJobs: [],
  }

  componentDidMount() {
    this.getDetails()
  }

  getDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.loading})

    const {id} = this.props.match.params
    const jwtToken = Cookies.get('jwt_token')

    const response = await fetch(`https://apis.ccbp.in/jobs/${id}`, {
      headers: {Authorization: `Bearer ${jwtToken}`},
    })

    const data = await response.json()

    if (response.ok) {
      this.setState({
        jobDetails: data.job_details,
        similarJobs: data.similar_jobs,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderLoader = () => (
    <div data-testid="loader">
      <Loader type="ThreeDots" height="50" width="50" />
    </div>
  )

  renderFailure = () => (
    <div>
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1>Oops! Something Went Wrong</h1>
      <p>We cannot seem to find the page you are looking for</p>
      <button onClick={this.getDetails}>Retry</button>
    </div>
  )

  renderSuccess = () => {
    const {jobDetails, similarJobs} = this.state

    return (
      <div>
        <img src={jobDetails.company_logo_url} alt="job details company logo" />
        <h1>{jobDetails.title}</h1>
        <p>{jobDetails.rating}</p>
        <p>{jobDetails.location}</p>
        <p>{jobDetails.employment_type}</p>
        <p>{jobDetails.package_per_annum}</p>

        <h1>Description</h1>
        <p>{jobDetails.job_description}</p>

        <a href={jobDetails.company_website_url}>Visit</a>

        <h1>Skills</h1>
        <ul>
          {jobDetails.skills &&
            jobDetails.skills.map(skill => (
              <li key={skill.name}>
                <img src={skill.image_url} alt={skill.name} />
                <p>{skill.name}</p>
              </li>
            ))}
        </ul>

        <h1>Life at Company</h1>
        <h1>Description</h1>
        <p>
          {jobDetails.life_at_company && jobDetails.life_at_company.description}
        </p>
        {jobDetails.life_at_company && (
          <img
            src={jobDetails.life_at_company.image_url}
            alt="life at company"
          />
        )}

        <h1>Similar Jobs</h1>
        <ul>
          {similarJobs.map(job => (
            <li key={job.id}>
              <img src={job.company_logo_url} alt="similar job company logo" />
              <h1>{job.title}</h1>
              <p>{job.rating}</p>
              <p>{job.location}</p>
              <p>{job.employment_type}</p>
              <h1>Description</h1>
              <p>{job.job_description}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  renderContent = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.loading:
        return this.renderLoader()
      case apiStatusConstants.success:
        return this.renderSuccess()
      case apiStatusConstants.failure:
        return this.renderFailure()
      default:
        return null
    }
  }

  render() {
    if (!Cookies.get('jwt_token')) {
      return <Redirect to="/login" />
    }

    return (
      <>
        <Header />
        {this.renderContent()}
      </>
    )
  }
}

export default JobItemDetails
