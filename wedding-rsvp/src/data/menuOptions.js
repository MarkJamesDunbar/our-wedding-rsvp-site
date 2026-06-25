export const menuDetails = {
  intro: 'Please select one option per course.',
  legend: 'Allergens listed in brackets. (V) vegetarian · (Ve) vegan',
  sections: [
    {
      id: 'course_1',
      label: 'Starter',
      type: 'choice',
      options: [
        {
          value: "Beggar's Purse of Haggis with Clapshot of Neeps & Tatties, Glayva Cream Reduction",
          allergens: 'Contains: gluten, milk, egg, mustard'
        },
        {
          value: 'Asparagus and Gruyere Cheese Tart with Dressed Rocket',
          dietary: 'V',
          allergens: 'Contains: gluten, egg, milk'
        }
      ]
    },
    {
      id: 'course_2',
      label: 'Main',
      type: 'choice',
      options: [
        {
          value: 'Chicken Stuffed with Mozzarella & Green Pesto, Wrapped in Parma Ham, Roasted Tomato & Fresh Basil Sauce',
          allergens: 'Contains: milk, egg, sulphites'
        },
        {
          value: 'Fillet Mignon with Red Wine Reduction and Roasted Vine Tomatoes',
          allergens: 'Contains: sulphites'
        },
        {
          value: 'Tomato, Olive and Vegan Cheese Puff Tart with Sun Dried Tomato & Pesto Dressing',
          dietary: 'Ve',
          allergens: 'Contains: gluten, soya'
        }
      ]
    },
    {
      id: 'course_3',
      label: 'Dessert',
      type: 'choice',
      options: [
        {
          value: 'Rhubarb Parfait with Rhubarb Compote and Oatmeal Shortbread Crumb',
          allergens: 'Contains: gluten, egg, milk, soya, sulphites'
        },
        {
          value: 'Chocolate & Orange Torte with Burnt Orange and Mascarpone Cream',
          allergens: 'Contains: gluten, egg, milk, nuts/almonds, soya'
        }
      ]
    }
  ],
  childrensMenu: {
    label: "Children's Menu",
    items: [
      'Melon with Mango Coulis',
      'Macaroni & Cheese with Potato Wedges',
      'Chocolate Brownie with Ice Cream'
    ]
  }
};

export const courses = menuDetails.sections
  .filter((section) => section.type === 'choice')
  .map((section) => ({
    id: section.id,
    label: section.label,
    options: section.options.map((option, index) => ({
      value: option.value,
      label: `Choice ${index + 1} - ${option.value}`,
      dietary: option.dietary,
      allergens: option.allergens
    }))
  }));
