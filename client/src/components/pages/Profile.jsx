import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Container, Image, Card } from "react-bootstrap";
import { UserContext } from "../../context/UserContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";


const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const [activeSection, setActiveSection] = useState("collection");
  const [userCollection, setUserCollection] = useState([]);
  const [userWishlists, setUserWishlists] = useState([]);
  const [edit, setEdit] = useState(false);
  const skillLevelOptions = ["Beginner", "Intermediate", "Advanced"];
  const [initialValues, setInitialValues] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const initialData = {
        bio: user.bio || "",
        skillLevel: user.skillLevel || "",
      };
      setInitialValues(initialData);
    }
  }, [user]);

  const validationSchema = Yup.object({
    bio: Yup.string().required("Please fill out your bio"),
    skillLevel: Yup.string().required("Skill level is required"),
  });

  useEffect(() => {
    if (user) {
      fetch(`/${user.username}/collections`)
        .then((response) => response.json())
        .then((data) => {
          setUserCollection(data);
        })
        .catch((error) => console.log(error));
    }
  }, [user]);

  const [search, setSearch] = useState("");

  function handleSearch(e) {
    setSearch(e.target.value);
    setCurrentPage(1);
  }

  const searchedCollectionGunplas = [...userCollection].filter((el) => {
    const searchedNameMatch = el.gunpla.model
      .toLowerCase()
      .includes(search.toLowerCase());

    const searchedSeriesMatch =
      el.gunpla.series &&
      el.gunpla.series.toLowerCase().includes(search.toLowerCase());

    return searchedNameMatch || searchedSeriesMatch;
  });

  const searchedWishlistGunplas = [...userWishlists].filter((el) => {
    const searchedNameMatch = el.gunpla.model
      .toLowerCase()
      .includes(search.toLowerCase());

    const searchedSeriesMatch =
      el.gunpla.series &&
      el.gunpla.series.toLowerCase().includes(search.toLowerCase());

    return searchedNameMatch || searchedSeriesMatch;
  });

  useEffect(() => {
    if (user) {
      fetch(`/${user.username}/wishlists`)
        .then((response) => response.json())
        .then((data) => {
          setUserWishlists(data);
        })
        .catch((error) => console.log(error));
    }
  }, [user]);

  const switchView = (section) => {
    setActiveSection(section);
  };

  const handleCollectionDelete = (gunpla_id) => {
    fetch("/collections/remove", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gunpla_id: gunpla_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setUserCollection((prevState) =>
          prevState.filter((collection) => collection.gunpla.id !== gunpla_id)
        );
      });
  };

  const handleMoveToWishlist = (gunpla_id) => {
    fetch("/collections/move-to-wishlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gunpla_id: gunpla_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setUserCollection((prevState) =>
          prevState.filter((collection) => collection.gunpla.id !== gunpla_id)
        );
        fetch(`/${user.username}/wishlists`)
          .then((response) => response.json())
          .then((data) => {
            setUserWishlists(data);
          });
      });
  };

  const formatDate = (dateString) => {
    const dateObject = new Date(dateString);
    const options = { month: "long", day: "numeric", year: "numeric" };
    return dateObject.toLocaleDateString("en-US", options);
  };


  const renderCollections = () => {
    if (!searchedCollectionGunplas || userCollection.length === 0) {
      return <p>No collections found.</p>;
    }

    return (
      <Row>
        <input
          type="text"
          placeholder="Search by model name or series..."
          onChange={(e) => handleSearch(e)}
          className="profile-search"
        ></input>
        {searchedCollectionGunplas.map((collection) => (
          <div className="row mb-3" key={collection.id}>
            <div className="col">
              <Card>
                <div className="row g-0">
                  <div className="col-sm-3 d-flex align-items-center">
                    <Card.Img
                      src={collection.gunpla.model_img}
                      className="mx-auto"
                    />
                  </div>
                  <div className="col-sm-8 align-items-center">
                    <div className="card-body">
                      <h5 className="card-title">{collection.gunpla.model}</h5>
                      <p className="card-text">{collection.gunpla.series}</p>
                      <p className="card-text">
                        {collection.gunpla.release_date}
                      </p>
                      <p className="card-text text-truncate">
                        {collection.gunpla.notes}
                      </p>
                      <button
                        className="collection-button"
                        onClick={() =>
                          handleMoveToWishlist(collection.gunpla.id)
                        }
                      >
                        Move to Wishlist
                      </button>
                      <button
                        className="collection-button"
                        onClick={() =>
                          handleCollectionDelete(collection.gunpla.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ))}
      </Row>
    );
  };

  const handleWishlistDelete = (gunpla_id) => {
    fetch("/wishlist/remove", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gunpla_id: gunpla_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setUserWishlists((prevState) =>
          prevState.filter((wishlist) => wishlist.gunpla.id !== gunpla_id)
        );
      });
  };

  const handleMoveToCollection = (gunpla_id) => {
    fetch("/wishlist/move-to-collection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gunpla_id: gunpla_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setUserWishlists((prevState) =>
          prevState.filter((wishlist) => wishlist.gunpla.id !== gunpla_id)
        );
        fetch(`/${user.username}/collections`)
          .then((response) => response.json())
          .then((data) => {
            setUserCollection(data);
          });
      });
  };

  const renderWishlists = () => {
    if (!searchedWishlistGunplas || userWishlists.length === 0) {
      return <p>No wishlists found. </p>;
    }

    return (
      <Row>
        <input
          type="text"
          placeholder="Search by model name or series..."
          onChange={(e) => handleSearch(e)}
          className="profile-search"
        ></input>
        {searchedWishlistGunplas.map((wishlist) => (
          <div className="row mb-3" key={wishlist.id}>
            <div className="col">
              <Card>
                <div className="row g-0">
                  <div className="col-sm-3 d-flex align-items-center">
                    <Card.Img
                      src={wishlist.gunpla.model_img}
                      className="mx-auto"
                    />
                  </div>
                  <div className="col-sm-8 align-items-center">
                    <div className="card-body">
                      <h5 className="card-title">{wishlist.gunpla.model}</h5>
                      <p className="card-text">{wishlist.gunpla.series}</p>
                      <p className="card-text">
                        {wishlist.gunpla.release_date}
                      </p>
                      <p className="card-text text-truncate">
                        {wishlist.gunpla.notes}
                      </p>
                      <button
                        className="wishlist-button"
                        onClick={() =>
                          handleMoveToCollection(wishlist.gunpla.id)
                        }
                      >
                        Move to Collection
                      </button>
                      <button
                        className="wishlist-button"
                        onClick={() => handleWishlistDelete(wishlist.gunpla.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ))}
      </Row>
    );
  };

  const renderSkillLevelStars = () => {
    if (user.skill_level === "Beginner") {
      return <span>Beginner</span>;
    } else if (user.skill_level === "Intermediate") {
      return <span>Intermediate</span>;
    } else if (user.skill_level === "Advanced") {
      return <span>Advanced</span>;
    } else {
      return null;
    }
  };

  const renderStats = () => {
    if (!userCollection || userCollection.length === 0) {
      return (
        <p>
          No stats to be tracked. Please add models to your collection /
          wishlist
        </p>
      );
    }

    const totalGunplas = userCollection.length;
    const totalWishlistedItems = userWishlists.length;
    const totalGunplasByGrade = {};

    userCollection.forEach((collection) => {
      const grade = collection.gunpla.grade;
      if (grade in totalGunplasByGrade) {
        totalGunplasByGrade[grade]++;
      } else {
        totalGunplasByGrade[grade] = 1;
      }
    });

    return (
      <div>
        <h3>Stats</h3>
        <p>Total Gunplas Collected: {totalGunplas}</p>
        <p>Total Wishlisted Items: {totalWishlistedItems}</p>
        <h5>Gunplas Collected/Built by Grade:</h5>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {Object.entries(totalGunplasByGrade).map(([grade, count]) => (
            <li key={grade}>
              {grade}: {count}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const handleSubmit = (values, { setSubmitting, setErrors }) => {
    const data = {
      bio: values.bio,
      skill_level: values.skillLevel,
    };

    fetch(`/users/${user.username}/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Could not update user profile");
        }
      })
      .then((updatedUser) => {
        updateUser(updatedUser);
        setSubmitting(false);
        setEdit(false);
      })
      .catch((error) => {
        setErrors({ bio: error.message });

        setSubmitting(false);
      });
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <Container>
      {user ? (
        <>
          <Row>
            <Col md={4}>
              <Image
                src={user.profile_pic}
                alt="profile_picture"
                className="profile-pic"
                roundedCircle
              />
            </Col>
            <Col md={8}>
              <h2>{user.username}</h2>{" "}
              <button onClick={() => setEdit(true)}>Edit Profile</button>
              <p>Member since: {formatDate(user.created_at)}</p>
              {!edit ? (
                <>
                  <p>Skill Level: {renderSkillLevelStars()}</p>
                  <p>Bio: {user.bio}</p>
                </>
              ) : (
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  <Form>
                    <div className="form-group">
                      <label htmlFor="skillLevel">Skill Level:</label>
                      <Field
                        as="select"
                        name="skillLevel"
                        id="skillLevel"
                        className="form-control form-field"
                      >
                        <option value="">Select Skill Level</option>
                        {skillLevelOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="skillLevel"
                        component="div"
                        className="error-message"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="bio">Bio:</label>
                      <Field
                        type="text"
                        name="bio"
                        id="bio"
                        className="form-control form-field"
                      />
                      <ErrorMessage
                        name="bio"
                        component="div"
                        className="error-message"
                      />
                    </div>
                    <button
                      type="submit"
                      className="submit-button btn btn-primary signup-button"
                    >
                      Submit
                    </button>
                  </Form>
                </Formik>
              )}
            </Col>
          </Row>
          <hr />
          <Row>
            {renderStats()}
            <hr />
            <Col
              md={2}
              style={{ order: activeSection === "collection" ? 1 : 2 }}
              className="section-button"
            >
              <h2
                className={
                  activeSection === "collection"
                    ? "collection-section active"
                    : "collection-section"
                }
                onClick={() => switchView("collection")}
              >
                Collection
              </h2>
            </Col>
            <Col
              md={2}
              style={{ order: activeSection === "collection" ? 2 : 1 }}
              className="section-button"
            >
              <h2
                className={
                  activeSection === "wishlist"
                    ? "wishlist-section active"
                    : "wishlist-section"
                }
                onClick={() => switchView("wishlist")}
              >
                Wishlist
              </h2>
            </Col>
          </Row>
          <hr />
          <div>
            {activeSection === "collection"
              ? renderCollections()
              : renderWishlists()}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </Container>
  );
};

export default Profile;