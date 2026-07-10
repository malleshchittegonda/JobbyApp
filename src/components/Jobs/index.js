import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {Link} from 'react-router-dom'
import Header from '../Header'

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
    <div data-testid="loader">
      <Loader type="ThreeDots" height="50" width="50" />
    </div>
  )

  renderProfile = () => {
    const {profileStatus, profile} = this.state

    if (profileStatus === apiStatus.loading) return this.renderLoader()

    if (profileStatus === apiStatus.failure) {
      return <button onClick={this.getProfile}>Retry</button>
    }

    return (
      <div>
        <img src={profile.profile_image_url} alt="profile" />
        <h1>{profile.name}</h1>
        <p>{profile.short_bio}</p>
      </div>
    )
  }

  renderJobsSuccess = () => {
    const {jobsList} = this.state

    if (jobsList.length === 0) {
      return (
        <div>
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
          />
          <h1>No Jobs Found</h1>
          <p>We could not find any jobs. Try other filters</p>
        </div>
      )
    }

    return (
      <ul>
        {jobsList.map(job => (
          <li key={job.id}>
            <Link to={`/jobs/${job.id}`}>
              <img src={job.company_logo_url} alt="company logo" />
              <h1>{job.title}</h1>
              <p>{job.rating}</p>
              <p>{job.location}</p>
              <p>{job.employment_type}</p>
              <h1>Description</h1>
              <p>{job.job_description}</p>
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
          <div>
            <img
              src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
              alt="failure view"
            />
            <h1>Oops! Something Went Wrong</h1>
            <p>We cannot seem to find the page you are looking for</p>
            <button onClick={this.getJobs}>Retry</button>
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
      <>
        <Header />

        {this.renderProfile()}

        <input
          type="search"
          value={this.state.searchInput}
          onChange={this.onChangeSearch}
        />

        <button
          type="button"
          data-testid="searchButton"
          onClick={this.onSearch}
        >
          Search
        </button>

        <h1>Type of Employment</h1>
        <ul>
          {employmentTypesList.map(each => (
            <li key={each.employmentTypeId}>
              <input
                id={each.employmentTypeId}
                type="checkbox"
                onChange={() => this.onChangeEmployment(each.employmentTypeId)}
              />
              <label htmlFor={each.employmentTypeId}>{each.label}</label>
            </li>
          ))}
        </ul>

        <h1>Salary Range</h1>
        <ul>
          {salaryRangesList.map(each => (
            <li key={each.salaryRangeId}>
              <input
                id={each.salaryRangeId}
                type="radio"
                name="salary"
                onChange={() => this.onChangeSalary(each.salaryRangeId)}
              />
              <label htmlFor={each.salaryRangeId}>{each.label}</label>
            </li>
          ))}
        </ul>

        {this.renderJobs()}
      </>
    )
  }
}

export default Jobs
