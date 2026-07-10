import {Component} from 'react'
import Cookies from 'js-cookie'
import {Redirect} from 'react-router-dom'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import './index.css'

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

    if (response.ok) {
      const data = await response.json()
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
    <div className="details-loading-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderFailure = () => (
    <div className="details-failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="details-error-illustration"
      />
      <h1 className="details-error-heading">Oops! Something Went Wrong</h1>
      <p className="details-error-desc">
        We cannot seem to find the page you are looking for
      </p>
      <button
        type="button"
        className="details-retry-button"
        onClick={this.getDetails}
      >
        Retry
      </button>
    </div>
  )

  renderSuccess = () => {
    const {jobDetails, similarJobs} = this.state

    return (
      <div className="job-item-details-route-container">
        <div className="detailed-job-card">
          <div className="job-card-header">
            <img
              src={jobDetails.company_logo_url}
              alt="job details company logo"
              className="detailed-company-logo"
            />
            <div className="job-title-rating-container">
              <h1 className="detailed-job-title">{jobDetails.title}</h1>
              <div className="rating-block">
                <p>{jobDetails.rating}</p>
              </div>
            </div>
          </div>

          <div className="job-meta-row">
            <div className="meta-left-group">
              <p className="meta-item">{jobDetails.location}</p>
              <p className="meta-item">{jobDetails.employment_type}</p>
            </div>
            <p className="package-text">{jobDetails.package_per_annum}</p>
          </div>

          <hr className="horizontal-rule" />

          <div className="section-header-row">
            <h1 className="detail-section-heading">Description</h1>
            <a
              href={jobDetails.company_website_url}
              target="_blank"
              rel="noreferrer"
              className="company-visit-link"
            >
              Visit
            </a>
          </div>
          <p className="detailed-description-text">
            {jobDetails.job_description}
          </p>

          <h1 className="detail-section-heading">Skills</h1>
          <ul className="skills-grid-list">
            {jobDetails.skills &&
              jobDetails.skills.map(skill => (
                <li key={skill.name} className="skill-item-card">
                  <img
                    src={skill.image_url}
                    alt={skill.name}
                    className="skill-img"
                  />
                  <p className="skill-name-text">{skill.name}</p>
                </li>
              ))}
          </ul>

          <h1 className="detail-section-heading">Life at Company</h1>
          <div className="life-at-company-split-block">
            <p className="life-at-company-desc">
              {jobDetails.life_at_company &&
                jobDetails.life_at_company.description}
            </p>
            {jobDetails.life_at_company && (
              <img
                src={jobDetails.life_at_company.image_url}
                alt="life at company"
                className="life-at-company-graphic"
              />
            )}
          </div>
        </div>

        <h1 className="similar-jobs-deck-heading">Similar Jobs</h1>
        <ul className="similar-jobs-flex-grid">
          {similarJobs.map(job => (
            <li key={job.id} className="similar-job-card-wrapper">
              <div className="job-card-header">
                <img
                  src={job.company_logo_url}
                  alt="similar job company logo"
                  className="detailed-company-logo"
                />
                <div className="job-title-rating-container">
                  <h1 className="detailed-job-title">{job.title}</h1>
                  <div className="rating-block">
                    <p>{job.rating}</p>
                  </div>
                </div>
              </div>
              <h1 className="detail-section-heading">Description</h1>
              <p className="detailed-description-text">{job.job_description}</p>
              <div className="meta-left-group">
                <p className="meta-item">{job.location}</p>
                <p className="meta-item">{job.employment_type}</p>
              </div>
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
