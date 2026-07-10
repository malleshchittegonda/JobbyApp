import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {Link} from 'react-router-dom'
import Header from '../Header'
import './index.css'

const apiStatus = {
  initial: 'INITIAL',
  loading: 'LOADING',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class Jobs extends Component {
  state = {
    jobsList: [],
    profile: {},
    searchInput: '',
    employmentTypes: [],
    salaryRange: '',
    jobsStatus: apiStatus.initial,
    profileStatus: apiStatus.initial,
  }

  componentDidMount() {
    this.getProfile()
    this.getJobs()
  }

  getProfile = async () => {
    this.setState({profileStatus: apiStatus.loading})
    const jwtToken = Cookies.get('jwt_token')

    const response = await fetch('https://apis.ccbp.in/profile', {
      headers: {Authorization: `Bearer ${jwtToken}`},
    })

    if (response.ok) {
      const data = await response.json()
      this.setState({
        profile: data.profile_details,
        profileStatus: apiStatus.success,
      })
    } else {
      this.setState({profileStatus: apiStatus.failure})
    }
  }

  getJobs = async () => {
    const {employmentTypes, salaryRange, searchInput} = this.state
    this.setState({jobsStatus: apiStatus.loading})

    const types = employmentTypes.join(',')
    const url = `https://apis.ccbp.in/jobs?employment_type=${types}&minimum_package=${salaryRange}&search=${searchInput}`
    const jwtToken = Cookies.get('jwt_token')

    const response = await fetch(url, {
      headers: {Authorization: `Bearer ${jwtToken}`},
    })

    if (response.ok) {
      const data = await response.json()
      this.setState({jobsList: data.jobs, jobsStatus: apiStatus.success})
    } else {
      this.setState({jobsStatus: apiStatus.failure})
    }
  }

  onChangeSearch = e => this.setState({searchInput: e.target.value})

  onSearch = () => this.getJobs()

  onChangeEmployment = id => {
    const {employmentTypes} = this.state
    if (employmentTypes.includes(id)) {
      this.setState(
        {employmentTypes: employmentTypes.filter(each => each !== id)},
        this.getJobs,
      )
    } else {
      this.setState({employmentTypes: [...employmentTypes, id]}, this.getJobs)
    }
  }

  onChangeSalary = id => {
    this.setState({salaryRange: id}, this.getJobs)
  }

  renderLoader = () => (
    <div className="jobs-central-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderProfile = () => {
    const {profileStatus, profile} = this.state

    if (profileStatus === apiStatus.loading) {
      return (
        <div className="profile-retry-container">
          <Loader type="ThreeDots" color="#ffffff" height="40" width="40" />
        </div>
      )
    }

    if (profileStatus === apiStatus.failure) {
      return (
        <div className="profile-retry-container">
          <button
            type="button"
            className="profile-retry-btn"
            onClick={this.getProfile}
          >
            Retry
          </button>
        </div>
      )
    }

    return (
      <div className="profile-card">
        <img
          src={profile.profile_image_url}
          alt="profile"
          className="profile-img"
        />
        <h1 className="profile-name">{profile.name}</h1>
        <p className="profile-bio">{profile.short_bio}</p>
      </div>
    )
  }

  renderJobsSuccess = () => {
    const {jobsList} = this.state

    if (jobsList.length === 0) {
      return (
        <div className="no-jobs-view-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
            className="status-illustration-img"
          />
          <h1 className="status-view-heading">No Jobs Found</h1>
          <p className="status-view-desc">
            We could not find any jobs. Try other filters
          </p>
        </div>
      )
    }

    return (
      <ul className="jobs-deck-list">
        {jobsList.map(job => (
          <li key={job.id}>
            <Link to={`/jobs/${job.id}`} className="job-card-clickable-link">
              <div className="job-deck-item-card">
                <div className="job-card-header">
                  <img
                    src={job.company_logo_url}
                    alt="company logo"
                    className="company-logo-img"
                  />
                  <div className="title-rating-stack">
                    <h1 className="job-title-h1">{job.title}</h1>
                    <div className="rating-row">
                      <p>{job.rating}</p>
                    </div>
                  </div>
                </div>

                <div className="meta-stats-row">
                  <div className="meta-left-block">
                    <p className="meta-text-item">{job.location}</p>
                    <p className="meta-text-item">{job.employment_type}</p>
                  </div>
                  <p className="salary-text">{job.package_per_annum}</p>
                </div>

                <hr className="card-inner-divider" />

                <h1 className="card-section-heading">Description</h1>
                <p className="job-short-desc">{job.job_description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  renderJobs = () => {
    const {jobsStatus} = this.state

    switch (jobsStatus) {
      case apiStatus.loading:
        return this.renderLoader()
      case apiStatus.failure:
        return (
          <div className="jobs-failure-view-container">
            <img
              src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
              alt="failure view"
              className="status-illustration-img"
            />
            <h1 className="status-view-heading">Oops! Something Went Wrong</h1>
            <p className="status-view-desc">
              We cannot seem to find the page you are looking for
            </p>
            <button
              type="button"
              className="jobs-retry-btn"
              onClick={this.getJobs}
            >
              Retry
            </button>
          </div>
        )
      case apiStatus.success:
        return this.renderJobsSuccess()
      default:
        return null
    }
  }

  render() {
    const {employmentTypesList, salaryRangesList} = this.props

    return (
      <div className="jobs-route-bg-container">
        <Header />

        <div className="jobs-content-container">
          <aside className="jobs-sidebar">
            {this.renderProfile()}

            <hr className="filter-divider" />

            <h1 className="filter-heading">Type of Employment</h1>
            <ul className="filters-list">
              {employmentTypesList.map(each => (
                <li key={each.employmentTypeId} className="filter-item">
                  <input
                    id={each.employmentTypeId}
                    type="checkbox"
                    className="filter-checkbox"
                    onChange={() =>
                      this.onChangeEmployment(each.employmentTypeId)
                    }
                  />
                  <label
                    htmlFor={each.employmentTypeId}
                    className="filter-label"
                  >
                    {each.label}
                  </label>
                </li>
              ))}
            </ul>

            <hr className="filter-divider" />

            <h1 className="filter-heading">Salary Range</h1>
            <ul className="filters-list">
              {salaryRangesList.map(each => (
                <li key={each.salaryRangeId} className="filter-item">
                  <input
                    id={each.salaryRangeId}
                    type="radio"
                    name="salary"
                    className="filter-radio"
                    onChange={() => this.onChangeSalary(each.salaryRangeId)}
                  />
                  <label htmlFor={each.salaryRangeId} className="filter-label">
                    {each.label}
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          <main className="jobs-main-content-pane">
            <div className="search-input-group">
              <input
                type="search"
                className="search-field"
                placeholder="Search"
                value={this.state.searchInput}
                onChange={this.onChangeSearch}
              />
              <button
                type="button"
                className="search-btn-icon"
                data-testid="searchButton"
                onClick={this.onSearch}
              >
                Search
              </button>
            </div>

            {this.renderJobs()}
          </main>
        </div>
      </div>
    )
  }
}

export default Jobs
