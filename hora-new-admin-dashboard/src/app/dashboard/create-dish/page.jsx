"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './DishManagementForm.module.css';

const DishManagementForm = () => {
  // Convert single selection fields to arrays for multiple selection
  const [formData, setFormData] = useState({
    dishName: '',
    dishImage: null,
    vegNon: '',
    dishType: '',
    category: [], // Changed to array
    cuisineType: [], // Changed to array
    mealType: [], // Changed to array
    dishRate: '',
    preparation: '',
    perPlateQuantity: '',
    quantityUnit: '',
    cookingMinutes: '',
    preparationMinutes: '',
    peopleServed: '',
    generalAppliance: [], // Changed to array
    specialAppliance: [], // Changed to array
    gasRequired: '',
    description: '',
    dishDescription: '',
    servingDish: [], // Changed to array
    foodDeliveryHora: '',
    foodDeliveryHoraQuantity: '',
    foodDeliveryVendor: '',
    foodDeliveryVendorQuantity: ''
  });
  
  const fixedUnit = 'Gram';

  const [options, setOptions] = useState({
    vegNonOptions: [
      { _id: '1', name: 'Veg' },
      { _id: '0', name: 'Non-Veg' }
    ],
    dishTypeOptions: [
      { _id: 'main-dish', name: 'Main Dish' },
      { _id: 'serving-dish', name: 'Serving Dish' }
    ],
    categoryOptions: [
      { _id: 'breakfast', name: 'Breakfast' },
      { _id: 'lunch', name: 'Lunch' },
      { _id: 'dinner', name: 'Dinner' }
    ],
    cuisineTypeOptions: [],
    mealTypeOptions: [],
    preparationOptions: [
      { _id: 'true', name: 'true' },
      { _id: 'false', name: 'false' }
    ],
    ingredientOptions: [],
    quantityUnitOptions: [
      { _id: 'gram', name: 'Gram' },
      { _id: 'kg', name: 'Kg' },
      { _id: 'litre', name: 'Litre' },
      { _id: 'ml', name: 'ML' },
      { _id: 'pieces', name: 'Pieces' }
    ],
    peopleServedOptions: Array.from({ length: 12 }, (_, i) => ({ _id: (i + 1).toString(), name: (i + 1).toString() })),
    generalApplianceOptions: [],
    specialApplianceOptions: [],
    gasRequiredOptions: [
      { _id: 'yes', name: 'Yes' },
      { _id: 'no', name: 'No' }
    ],
    servingDishOptions: []
  });

  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [searchTerms, setSearchTerms] = useState({});
  
  const dropdownRefs = useRef({});

  const toggleDropdown = (name) => {
    setDropdownOpen(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const closeDropdown = (name) => {
    setDropdownOpen(prev => ({
      ...prev,
      [name]: false
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      for (const key in dropdownRefs.current) {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          closeDropdown(key);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchAllOptions = async () => {
      setIsLoading(true);
      try {
        const [
          cuisineTypeResponse,
          mealTypeResponse,
          ingredientResponse,
          generalApplianceResponse,
          specialApplianceResponse,
          servingDishResponse
        ] = await Promise.all([
          fetchDropdownOptions('configuration/admin_configuration_list_all', { per_page: "500", type: "cuisine" }),
          fetchDropdownOptions('meals/admin_meals_list', { per_page: "500" }),
          fetchDropdownOptions('ingredient/admin_ingredient_list', { per_page: "500", page: "1", name: "" }),
          fetchDropdownOptions('configuration/admin_configuration_list_all', { per_page: "500", type: "appliance", sub_type: "0" }),
          fetchDropdownOptions('configuration/admin_configuration_list_all', { per_page: "500", type: "appliance", sub_type: "1" }),
          fetchDropdownOptions('configuration/admin_configuration_list_all', { per_page: "500", type: "dish" })
        ]);

        setOptions(prevOptions => ({
          ...prevOptions,
          cuisineTypeOptions: cuisineTypeResponse,
          mealTypeOptions: mealTypeResponse,
          ingredientOptions: ingredientResponse,
          generalApplianceOptions: generalApplianceResponse,
          specialApplianceOptions: specialApplianceResponse,
          servingDishOptions: servingDishResponse
        }));
      } catch (error) {
        console.error("Error loading dropdown options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllOptions();
  }, []);

  const fetchDropdownOptions = async (endpoint, payload = { per_page: "500" }) => {
    const apiUrl = `http://localhost:5000/api/${endpoint}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error fetching ${endpoint}: ${response.statusText}`);
      }

      const data = await response.json();
      if (endpoint.includes('ingredient/admin_ingredient_list')) {
        return data.data.ingredient || [];
      } else if (endpoint.includes('meals/admin_meals_list')) {
        return data.data.meal || [];
      } else if (endpoint.includes('configuration/admin_configuration_list_all')) {
        return data.data.configuration || [];
      }
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return [];
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSearchChange = (e, name) => {
    const { value } = e.target;
    setSearchTerms({
      ...searchTerms,
      [name]: value.toLowerCase()
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:5000/api/image_upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Error uploading image');
        }

        const data = await response.json();
        console.log(data, "dataaa");
        setFormData(prevData => ({
          ...prevData,
          dishImage: data.data
        }));

        if (errors.dishImage) {
          setErrors({
            ...errors,
            dishImage: ''
          });
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleDropdownSelect = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Close the dropdown after selecting an option for single-select fields
    closeDropdown(name);

    // Show serving dish dropdown if "Serving Dish" is selected
    if (name === 'dishType' && value === 'serving-dish') {
      setDropdownOpen(prev => ({
        ...prev,
        servingDish: true
      }));
    }
  };

  // New handler for multiple selection toggles (checkbox)
  const handleMultiSelectToggle = (name, value) => {
    setFormData(prevData => {
      const currentValues = [...prevData[name]];
      
      if (currentValues.includes(value)) {
        // Remove if already selected
        return {
          ...prevData,
          [name]: currentValues.filter(v => v !== value)
        };
      } else {
        // Add if not selected
        return {
          ...prevData,
          [name]: [...currentValues, value]
        };
      }
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const addIngredient = () => {
    if (!selectedIngredient || !ingredientQuantity || !ingredientUnit) {
      return;
    }

    const ingredient = options.ingredientOptions.find(ing => ing._id === selectedIngredient);
    console.log(ingredient, "ingredient");
    if (ingredient) {
      const newIngredient = {
        id: Date.now(),
        ingredientId: selectedIngredient,
        name: ingredient.name,
        quantity: ingredientQuantity,
        unit: ingredientUnit,
        image: ingredient.image || ''
      };

      setSelectedIngredients([...selectedIngredients, newIngredient]);

      setSelectedIngredient('');
      setIngredientQuantity('');
      setIngredientUnit('');

      closeDropdown('ingredient');
      closeDropdown('ingredientUnit');
    }
  };

  const removeIngredient = (id) => {
    setSelectedIngredients(selectedIngredients.filter(ing => ing.id !== id));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.dishName) newErrors.dishName = 'Dish name is required';
    if (!formData.dishImage) newErrors.dishImage = 'Dish image is required';
    if (!formData.vegNon) newErrors.vegNon = 'Veg/Non selection is required';
    if (!formData.dishType) newErrors.dishType = 'Dish type is required';
    if (formData.cuisineType.length === 0) newErrors.cuisineType = 'At least one cuisine type is required';
    if (formData.mealType.length === 0) newErrors.mealType = 'At least one meal type is required';
    if (!formData.preparation) newErrors.preparation = 'Preparation is required';
    if (!formData.cookingMinutes) newErrors.cookingMinutes = 'Cooking minutes is required';
    if (!formData.preparationMinutes) newErrors.preparationMinutes = 'Preparation minutes is required';
    if (!formData.gasRequired) newErrors.gasRequired = 'Gas required selection is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const per_plate_qty = {
      qty: formData.perPlateQuantity,
      unit: formData.quantityUnit
    };

    const cuisineArray = [
      formData.foodDeliveryHora,
      formData.foodDeliveryHoraQuantity,
      fixedUnit,
      formData.foodDeliveryVendor,
      formData.foodDeliveryVendorQuantity,
      fixedUnit
    ];

    

    if (validateForm()) {
      const requestData = {
        name: formData.dishName,
        image: formData.dishImage,
        is_dish: formData.vegNon,
        dish_allow: true,
        serving_dish: formData.servingDish,
        cuisineId: formData.cuisineType,
        mealId: formData.mealType,
        dish_rate: formData.dishRate,
        is_preparation: formData.preparation,
        per_plate_qty: per_plate_qty,
        cooking_min: formData.cookingMinutes,
        preparation_min: formData.preparationMinutes,
        special_appliance_id: formData.specialAppliance,
        general_appliance_id: formData.generalAppliance,
        is_gas: formData.gasRequired === 'yes',
        description: formData.description,
        preperationtext: formData.dishDescription,
        noofpeopleServedByDish: formData.peopleServed,
        ingredientUsed: selectedIngredients.map(ing => ({
          _id: ing.ingredientId,
          name: ing.name,
          qty: ing.quantity,
          unit: ing.unit,
          image: ing.image
        })),
        categoryIds: formData.category,
        catId: formData.category,
        cuisineArray: cuisineArray,
        status: 1
      };

      console.log('Submitting data:', requestData);

      try {
        const response = await fetch('http://localhost:5000/api/dish/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error('Error creating dish');
        }

        const data = await response.json();
        console.log('Dish created successfully:', data);
        alert('Dish created successfully!');
      } catch (error) {
        console.error('Error creating dish:', error);
        alert('Error creating dish. Please try again.');
      }
    } else {
      console.log('Form has errors', errors);
    }
  };

  // For single-select dropdowns
  const renderDropdown = (name, label, options = [], isRequired = false) => {
    const isOpen = dropdownOpen[name] || false;
    const value = formData[name];
    const hasError = errors[name];
    const searchTerm = searchTerms[name] || '';

    const selectedOption = options.find(opt => opt._id === value);
    const displayText = selectedOption ? selectedOption.name : `-- Select ${label} --`;

    const filteredOptions = searchTerm 
      ? options.filter(opt => opt.name.toLowerCase().includes(searchTerm)) 
      : options;

    return (
      <div className={styles["form-field"]}>
        <label className={isRequired ? styles["required-field"] : ""}>{label}</label>
        <div 
          className={styles["dropdown-container"]} 
          ref={el => dropdownRefs.current[name] = el}
        >
          <div
            className={`${styles["dropdown-selected"]} ${hasError ? styles["error"] : ''}`}
            onClick={() => toggleDropdown(name)}
          >
            <span>{displayText}</span>
            <span className={styles["dropdown-arrow"]}>▼</span>
          </div>

          {isOpen && (
            <div className={styles["dropdown-menu"]}>
              <div className={styles["dropdown-search"]}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e, name)}
                />
              </div>
              <div className={styles["dropdown-options-container"]}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map(option => (
                    <div 
                      key={option._id} 
                      className={`${styles["dropdown-option"]} ${value === option._id ? styles["selected"] : ""}`}
                      onClick={() => handleDropdownSelect(name, option._id)}
                    >
                      <input
                        type="radio"
                        id={`${name}-${option._id}`}
                        checked={value === option._id}
                        onChange={() => {}}
                      />
                      <label htmlFor={`${name}-${option._id}`}>{option.name}</label>
                    </div>
                  ))
                ) : (
                  <div className={styles["no-options"]}>No options found</div>
                )}
              </div>
            </div>
          )}
        </div>
        {hasError && <div className={styles["error-message"]}>{hasError}</div>}
      </div>
    );
  };

  // For multi-select dropdowns
  const renderMultiDropdown = (name, label, options = [], isRequired = false) => {
    const isOpen = dropdownOpen[name] || false;
    const values = formData[name] || [];
    const hasError = errors[name];
    const searchTerm = searchTerms[name] || '';

    const selectedNames = values.map(id => {
      const option = options.find(opt => opt._id === id);
      return option ? option.name : '';
    }).filter(Boolean);

    const displayText = selectedNames.length > 0 
      ? selectedNames.join(', ') 
      : `-- Select ${label} --`;

    const filteredOptions = searchTerm 
      ? options.filter(opt => opt.name.toLowerCase().includes(searchTerm)) 
      : options;

    return (
      <div className={styles["form-field"]}>
        <label className={isRequired ? styles["required-field"] : ""}>{label}</label>
        <div 
          className={styles["dropdown-container"]} 
          ref={el => dropdownRefs.current[name] = el}
        >
          <div
            className={`${styles["dropdown-selected"]} ${hasError ? styles["error"] : ''}`}
            onClick={() => toggleDropdown(name)}
          >
            <span className={styles["selected-text"]}>{displayText}</span>
            <span className={styles["dropdown-arrow"]}>▼</span>
          </div>

          {isOpen && (
            <div className={styles["dropdown-menu"]}>
              <div className={styles["dropdown-search"]}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e, name)}
                />
              </div>
              <div className={styles["dropdown-options-container"]}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map(option => (
                    <div 
                      key={option._id} 
                      className={`${styles["dropdown-option"]} ${values.includes(option._id) ? styles["selected"] : ""}`}
                      onClick={() => handleMultiSelectToggle(name, option._id)}
                    >
                      <input
                        type="checkbox"
                        id={`${name}-${option._id}`}
                        checked={values.includes(option._id)}
                        onChange={() => {}}
                        className={styles["square-checkbox"]}
                      />
                      <label htmlFor={`${name}-${option._id}`}>{option.name}</label>
                    </div>
                  ))
                ) : (
                  <div className={styles["no-options"]}>No options found</div>
                )}
              </div>
              <div className={styles["dropdown-actions"]}>
                <button 
                  type="button" 
                  className={styles["btn-apply"]}
                  onClick={() => closeDropdown(name)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
        {hasError && <div className={styles["error-message"]}>{hasError}</div>}
      </div>
    );
  };

  const renderIngredientDropdown = () => {
    const isOpen = dropdownOpen.ingredient || false;
    const searchTerm = searchTerms.ingredient || '';
    
    const filteredOptions = searchTerm 
      ? options.ingredientOptions.filter(opt => opt.name.toLowerCase().includes(searchTerm)) 
      : options.ingredientOptions;

    return (
      <div className={styles["dropdown-container"]} ref={el => dropdownRefs.current.ingredient = el}>
        <label>Select Ingredient</label>
        <div
          className={styles["dropdown-selected"]}
          onClick={() => toggleDropdown('ingredient')}
        >
          {selectedIngredient ?
            options.ingredientOptions.find(ing => ing._id === selectedIngredient)?.name :
            '-- Select Ingredient --'
          }
          <span className={styles["dropdown-arrow"]}>▼</span>
        </div>

        {isOpen && (
          <div className={styles["dropdown-menu"]}>
            <div className={styles["dropdown-search"]}>
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e, 'ingredient')}
              />
            </div>
            <div className={styles["dropdown-options-container"]}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map(ingredient => (
                  <div 
                    key={ingredient._id} 
                    className={`${styles["dropdown-option"]} ${selectedIngredient === ingredient._id ? styles["selected"] : ""}`}
                    onClick={() => setSelectedIngredient(ingredient._id)}
                  >
                    <input
                      type="radio"
                      id={`ingredient-${ingredient._id}`}
                      checked={selectedIngredient === ingredient._id}
                      onChange={() => {}}
                    />
                    <label htmlFor={`ingredient-${ingredient._id}`}>{ingredient.name}</label>
                  </div>
                ))
              ) : (
                <div className={styles["no-options"]}>No ingredients found</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderIngredientUnitDropdown = () => {
    const isOpen = dropdownOpen.ingredientUnit || false;
    
    return (
      <div className={styles["dropdown-container"]} ref={el => dropdownRefs.current.ingredientUnit = el}>
        <label>Unit</label>
        <div
          className={styles["dropdown-selected"]}
          onClick={() => toggleDropdown('ingredientUnit')}
          // style={{width: '130%'}}
        >
          {ingredientUnit ?
            options.quantityUnitOptions.find(unit => unit._id === ingredientUnit)?.name :
            '-- Select Unit --'
          }
          <span className={styles["dropdown-arrow"]}>▼</span>
        </div>

        {isOpen && (
          <div className={styles["dropdown-menu"]}>
            <div className={styles["dropdown-options-container"]}>
              {options.quantityUnitOptions.map(unit => (
                <div 
                  key={unit._id} 
                  className={`${styles["dropdown-option"]} ${ingredientUnit === unit._id ? styles["selected"] : ""}`}
                  onClick={() => setIngredientUnit(unit._id)}
                >
                  <input
                    type="radio"
                    id={`unit-${unit._id}`}
                    checked={ingredientUnit === unit._id}
                    onChange={() => {}}
                  />
                  <label htmlFor={`unit-${unit._id}`}>{unit.name}</label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles["dish-form-container"]}>
        <div className={styles["loading-spinner"]}>
          <div className={styles["spinner"]}></div>
          <p>Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["dish-form-container"]}>
      <h2 className={styles["form-header"]}>Add New Dish</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles["form-grid"]}>
          <div className={styles["form-field"]}>
            <label className={styles["required-field"]}>Dish Name</label>
            <input
              type="text"
              name="dishName"
              value={formData.dishName}
              onChange={handleInputChange}
              placeholder="Enter dish name"
              className={styles["input-field"]}
            />
            {errors.dishName && <div className={styles["error-message"]}>{errors.dishName}</div>}
          </div>

          <div className={styles["form-field"]}>
            <label className={styles["required-field"]}>Dish Image</label>
            <input
              type="file"
              name="dishImage"
              onChange={handleFileChange}
              accept="image/*"
              className={styles["file-input"]}
            />
            {errors.dishImage && <div className={styles["error-message"]}>{errors.dishImage}</div>}
          </div>

          {renderDropdown("vegNon", "Veg/Non", options.vegNonOptions, true)}
          {renderDropdown("dishType", "Dish Type", options.dishTypeOptions, true)}
          
          {formData.dishType === 'serving-dish' && 
            renderMultiDropdown("servingDish", "Serving Dish", options.servingDishOptions, true)}
          
          {renderMultiDropdown("category", "Category", options.categoryOptions)}
          {renderMultiDropdown("cuisineType", "Cuisine Type", options.cuisineTypeOptions, true)}
          {renderMultiDropdown("mealType", "Meal Type", options.mealTypeOptions, true)}

          <div className={styles["form-field"]}>
            <label>Dish Rate (Chef)</label>
            <input
              type="number"
              name="dishRate"
              value={formData.dishRate}
              onChange={handleInputChange}
              placeholder="Enter dish rate"
              min="0"
              step="0.01"
              className={styles["input-field"]}
            />
          </div>

<div className={styles["form-field"]}>
            <label>Hora Food Delivery Rate</label>
            <input
              type="number"
              name="foodDeliveryHora"
              value={formData.foodDeliveryHora}
              onChange={handleInputChange}
              placeholder="Hora Food Delivery Rate"
              min="0"
              step="0.01"
              className={styles["input-field"]}
            />
          </div>

<div className={styles["form-field"]}>
            <label>Food Delivery Quantity(Gram)</label>
            <input
              type="number"
              name="foodDeliveryHoraQuantity"
              value={formData.foodDeliveryHoraQuantity}
              onChange={handleInputChange}
              placeholder="Food Delivery Quantity"
              min="0"
              step="0.01"
              className={styles["input-field"]}
            />
          </div>

<div className={styles["form-field"]}>
            <label>Vendor Food Delivery Rate</label>
            <input
              type="number"
              name="foodDeliveryVendor"
              value={formData.foodDeliveryVendor}
              onChange={handleInputChange}
              placeholder="Vendor Food Delivery Rate"
              min="0"
              step="0.01"
              className={styles["input-field"]}
            />
          </div>

<div className={styles["form-field"]}>
            <label>Vendor Food Delivery Quantity(Gram)</label>
            <input
              type="number"
              name="foodDeliveryVendorQuantity"
              value={formData.foodDeliveryVendorQuantity}
              onChange={handleInputChange}
              placeholder="Vendor Food Delivery Quantity"
              min="0"
              step="0.01"
              className={styles["input-field"]}
            />
          </div>

          {renderDropdown("preparation", "Preparation", options.preparationOptions, true)}

          <div className={styles["ingredient-section"]}>
            <h3 className={styles["section-header"]}>Ingredients</h3>

            <div className={styles["ingredient-selection"]}>
              {renderIngredientDropdown()}

              <div className={styles["form-field"]}>
                <label>Quantity</label>
                <input
                  type="number"
                  value={ingredientQuantity}
                  onChange={(e) => setIngredientQuantity(e.target.value)}
                  placeholder="Quantity"
                  min="0"
                  step="0.01"
                  className={styles["input-field"]}
                />
              </div>

              {renderIngredientUnitDropdown()}

              <button
                type="button"
                className={`${styles["btn"]} ${styles["btn-primary"]}`}
                onClick={addIngredient}
              >
                Add
              </button>
            </div>

            <div className={styles["selected-ingredients"]}>
              <h4 className={styles["subsection-header"]}>Selected Ingredients</h4>
              {selectedIngredients.length === 0 ? (
                <p className={styles["no-data-message"]}>No ingredients added yet</p>
              ) : (
                <div className={styles["ingredients-list"]}>
                  {selectedIngredients.map(ing => (
                    <div key={ing.id} className={styles["ingredient-item"]}>
                      <span>{ing.name} - {ing.quantity} {options.quantityUnitOptions.find(u => u._id === ing.unit)?.name}</span>
                       {/* <img src={`https://horaservices.com/api/uploads/${ing.image}`} 
                        // alt={ing.name}
                      //  style={{ width: "100%", height: "auto" }} width={30} height={30}
                        // /> */}
                      <button
                        type="button"
                        className={`${styles["btn"]} ${styles["btn-danger"]}`}
                        onClick={() => removeIngredient(ing.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles["form-field"]}>
            <label>Per Plate Quantity</label>
            <input
              type="number"
              name="perPlateQuantity"
              value={formData.perPlateQuantity}
              onChange={handleInputChange}
              placeholder="Enter per plate quantity"
              className={styles["input-field"]}
            />
          </div>

          {renderDropdown("quantityUnit", "Quantity Unit", options.quantityUnitOptions)}

          <div className={styles["form-field"]}>
            <label className={styles["required-field"]}>Cooking Minutes</label>
            <input
              type="number"
              name="cookingMinutes"
              value={formData.cookingMinutes}
              onChange={handleInputChange}
              placeholder="Enter cooking minutes"
              min="0"
              className={styles["input-field"]}
            />
            {errors.cookingMinutes && <div className={styles["error-message"]}>{errors.cookingMinutes}</div>}
          </div>

          <div className={styles["form-field"]}>
            <label className={styles["required-field"]}>Preparation Minutes</label>
            <input
              type="number"
              name="preparationMinutes"
              value={formData.preparationMinutes}
              onChange={handleInputChange}
              placeholder="Enter preparation minutes"
              min="0"
              className={styles["input-field"]}
            />
            {errors.preparationMinutes && <div className={styles["error-message"]}>{errors.preparationMinutes}</div>}
          </div>

          {renderDropdown("peopleServed", "No. Of People Served By Dish", options.peopleServedOptions)}
          {renderMultiDropdown("generalAppliance", "General Appliance", options.generalApplianceOptions)}
          {renderMultiDropdown("specialAppliance", "Special Appliance", options.specialApplianceOptions)}
          {renderDropdown("gasRequired", "Gas Required", options.gasRequiredOptions, true)}

          <div className={`${styles["form-field"]} ${styles["full-width"]}`}>
            <label>Pre Preparation Dish Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter dish preparation description"
              rows="4"
              className={styles["textarea-field"]}
            />
          </div>

          <div className={`${styles["form-field"]} ${styles["full-width"]}`}>
            <label>Description of Dish</label>
            <textarea
              name="dishDescription"
              value={formData.dishDescription}
              onChange={handleInputChange}
              placeholder="Enter description of dish"
              rows="4"
              className={styles["textarea-field"]}
            />
          </div>

          <div className={styles["form-actions"]}>
            <button type="submit" className={`${styles["btn"]} ${styles["btn-success"]}`}>
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DishManagementForm;